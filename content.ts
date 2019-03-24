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

class ClearAllEvent extends CustomEvent<any> {
    target: HTMLElement;

    constructor(details) {
        super('clearall', {
            bubbles: true,
            cancelable: false,
            detail: details
        });
    }
}

class contentWatcher {
    count: number
    cacheSize: number
    clearall: (ev: CacheFillEvent) => void

    constructor(e: HTMLElement, cacheSize: number) {
        //Fire a CacheFillEvent after cacheCount input events (new characters).
        //Round up to the nearest character if using an IME (compositionend).
        this.count = 0;
        this.cacheSize = cacheSize;

        this.clearall = function(ev: CacheFillEvent) {
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
            submitDraft(patchfold.patchlist);
        }
        e.addEventListener('input', this.track);
        e.addEventListener('cachefill', )

        //Fire early if the user does something that looks like a transposition
        e.addEventListener('cut', (ev) => track(ev, true));
        e.addEventListener('copy', (ev) => {
            let psuedocut = function (ev: KeyboardEvent){
                if ( ["Backspace", "Clear", "Delete"].some(v => (v == ev.key)) )
                    track(ev, true);
                ev.target.removeEventListener('keydown', psuedocut);
                }
            ev.target.addEventListener('keydown', psuedocut);
        })
        e.addEventListener('dragstart', (ev) => track(ev, true));
        //TODO Make the background handler check for a deletion
        //followed by an insertion of the same characters.
    }
    track(ev: Event, override: boolean = false) {
        this.count++;
        if (override || this.count >= this.cacheSize) {
            this.count = 0;
            function fire(){
                const delta = Utility.agnosticGetInnerHTML(<HTMLElement>ev.target);
                const details = { 
                    original: original,
                    delta: delta
                }
                ev.target.dispatchEvent(new CacheFillEvent(details)); 
                original = delta;
            }
            if(ev instanceof InputEvent && ev.isComposing) {
                //Wait for compositionend
                ev.target.addEventListener("compositionend", () => fire());
            } else {
                fire();
            }
        }
    }
}


//Offscreen logic: content.js ought to run when page is idle.
//This *should* mean "after all page scripts are run" -- so 
//including e.g. Xenforo's own draft functionality.

let mincount: Promise<number> = browser.storage.sync.get('mincount');
let fresh = true;
const differ = new diff_match_patch()

function countWatcher(e: InputEvent) {
    const count = (<HTMLElement>e.target).innerHTML.length;

}

async function submitDraft(draft: Array<T.Patch>) : Promise<number> {
    return browser.runtime.sendMessage(draft);
}
