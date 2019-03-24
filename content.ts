import { Types as T } from './types';
import { Utility } from './utility';
import { diff_match_patch } from 'diff-match-patch';
import * as $ from 'jquery';
class CacheFillEvent extends CustomEvent<T.CachedDelta> {
    target: HTMLElement;

    constructor(details) {
        super('cachefill', {
            bubbles: true,
            cancelable: false,
            detail: details
        });
    }
}

class ClearAllEvent extends CustomEvent<never> {
    target: HTMLElement;

    constructor() {
        super('clearall', {
            bubbles: true,
            cancelable: false
        });
    }
}

class ContentWatcher {
    count: number
    cacheSize: number
    state: string
    slot: number

    constructor(e: HTMLElement, cacheSize: number, slot: number) {
        //Fire a CacheFillEvent after cacheCount input events (new characters).
        //Round up to the nearest character if using an IME (compositionend).
        this.count = 0;
        this.cacheSize = cacheSize;
        this.state = Utility.agnosticGetInnerHTML(e);
        this.slot = slot;

        e.addEventListener('input', this.track);
        e.addEventListener('cachefill', this.handleCacheFill)

        //Fire early if the user does something that looks like a transposition
        e.addEventListener('cut', (ev) => this.track(ev, true));
        e.addEventListener('copy', (ev) => {
            let psuedocut = function (ev: KeyboardEvent){
                if ( ["Backspace", "Clear", "Delete"].some(v => (v == ev.key)) )
                    this.track(ev, true);
                ev.target.removeEventListener('keydown', psuedocut);
                }
            ev.target.addEventListener('keydown', psuedocut);
        })
        e.addEventListener('dragstart', (ev) => this.track(ev, true));
        //TODO Make the background handler check for a deletion
        //followed by an insertion of the same characters.

        e.addEventListener('input', this.defineClearAll);
        e.addEventListener('clearall', this.handleClearAll);
    }

    track(ev: Event, override: boolean = false) {
        this.count++;
        if (override || this.count >= this.cacheSize) {
            this.count = 0;
            function fire(){
                const delta = Utility.agnosticGetInnerHTML(<HTMLElement>ev.target);
                const details = { 
                    original: this.state,
                    delta: delta
                }
                ev.target.dispatchEvent(new CacheFillEvent(details)); 
                this.state = delta;
            }
            if(ev instanceof InputEvent && ev.isComposing) {
                //Wait for compositionend
                ev.target.addEventListener("compositionend", () => fire());
            } else {
                fire();
            }
        }
    }

    /**
     * A ClearAllEvent is defined as any Input event
     * where the target starts with >1 characters and ends with 
     * 0 or 1. 
     * 
     * Technically that means there ought to be a check
     * for >1 characters, but since ContentWatchers aren't
     * aassigned until the character count passes
     * a certain size it should basically never come up.
     */
    defineClearAll(ev: InputEvent) {
        if((<HTMLElement>ev.target).innerHTML.length < 2) {
            ev.target.dispatchEvent(new ClearAllEvent());
        }
    }

    handleCacheFill(ev: CacheFillEvent) {
        let diff = differ.diff_main(ev.detail.original, ev.detail.delta);
        differ.diff_cleanupEfficiency(diff);
        let patchfold = diff.reduce<T.PatchFold>((acc:T.PatchFold, nxt) => {
            const patchl = nxt[1].length;
            switch(nxt[0]) {
                case -1: 
                     return {
                         cursor: acc.cursor, //deletion doesn't move the cursor
                         patchlist: acc.patchlist.concat([[T.PatchType.Deletion, acc.cursor, patchl]])
                     }
                case 0:
                     return {
                         cursor: acc.cursor + patchl,
                         patchlist: acc.patchlist
                     }
                case 1:
                     return {
                         cursor: acc.cursor + patchl,
                         patchlist: acc.patchlist.concat([[T.PatchType.Insertion, acc.cursor, nxt[1]]])
                     }
            }
        }, { cursor: 0, patchlist: [] });
        this.submitDraft(patchfold.patchlist);
    }

    handleClearAll(ev: ClearAllEvent) {
        this.deconstruct();   
    }

    async submitDraft(draft: Array<T.Patch>) : Promise<number> {
        return browser.runtime.sendMessage(draft);
    }
}


//Offscreen logic: content.js ought to run when page is idle.
//This *should* mean "after all page scripts are run" -- so 
//including e.g. Xenforo's own draft functionality.

let mincount: Promise<number> = browser.storage.sync.get('mincount');
let cachesize: Promise<number> = browser.storage.sync.get('cachesize');
let watchers = [];
let differ = new diff_match_patch();
let fresh = true;

async function watcherSpawner(e: InputEvent) {
    const target = <HTMLElement> e.target;
    const count = target.innerHTML.length;
    if (count > await mincount) {
        //TODO Assign new slot number
        watchers.push(new ContentWatcher(target, await cachesize));
    }
}

window.addEventListener("input", watcherSpawner);
