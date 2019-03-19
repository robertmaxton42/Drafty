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

class TranspositionEvent extends CustomEvent<T.Transposition> {
    target: HTMLElement;

    constructor(details: T.Transposition) {
        super('transposition', {
            bubbles: true,
            cancelable: false,
            detail: details
        })
    }
}

class contentWatcher {
    constructor(e: HTMLElement, cacheCount: number) {
        //Fire a CacheFillEvent after cacheCount input events (new characters).
        //Round up to the nearest character if using an IME (compositionend).
        e.addEventListener('input', function(){
            let count = 0;
            const original = Utility.agnosticGetInnerHTML(this);

            return (ev: InputEvent) => {
                count++;
                if (count >= cacheCount) {
                    count = 0;
                    function fire(){
                        const delta = Utility.agnosticGetInnerHTML(<HTMLElement>ev.target);
                        const details = { 
                            original: original,
                            delta: delta
                        }
                        ev.target.dispatchEvent(new CacheFillEvent(details)); 
                    }
                    if(ev.isComposing) {
                        //Wait for compositionend
                        ev.target.addEventListener("compositionend", () => fire());
                    } else {
                        fire();
                    }
                }
            }
        }());
        e.addEventListener('cachefill', (ev: CacheFillEvent) => {
            let diff = differ.diff_main(ev.detail.original, ev.detail.delta);
            differ.diff_cleanupEfficiency(diff);
            diff.reduce<T.PatchFold>((acc:T.PatchFold, nxt) => {
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
            }, { cursor: 0, patchlist: [] })
            for (const step of diff) {
                switch(step[0]) {
                    case -1:
                }
            }  
        })
        //TODO add event definitiion and listener for transposition
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


async function textareaHandler() {
    
}

async function textareaScan() {
    if (this.textContent.length > await mincount) {
        const draft = composeNewDraft(this.textContent);
        submitDraft(draft).then((slot) => this.draftySlot = slot);
    }
}

async function contentEditableScan() {
    if (this.textContent.length > await mincount) {
        const draft = composeNewDraft(this.innerHTML);
        submitDraft(draft).then((slot) => this.draftSlot = slot);
    }
}

function freshScan() {
    $( "textarea" ).map( textareaScan );
    $( "[contenteditable][contenteditable!='false']" ).map( contentEditableScan );
}

function composeNewDraft(draft: String) : ActiveDraft {
    return {
        oldDraft: draft,
        diff: "",
        lastDomain: window.location,
        slot: undefined
    }
}

function composeDiffDraft(draft: String, diff: String, slot: number) : ActiveDraft {
    return {
        oldDraft: draft,
        diff: diff,
        lastDomain: window.location,
        slot: slot
    }
}

async function submitDraft(draft: ActiveDraft) : Promise<number> {
    return browser.runtime.sendMessage(draft);
}
