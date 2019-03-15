import { DraftRecord, ActiveDraft, ActiveRecord } from './types';
import { diff_match_patch } from 'diff-match-patch';
import * as $ from 'jquery';

class contentWatcher {
    constructor(e: HTMLElement) {
        
    }
}


//Offscreen logic: content.js ought to run when page is idle.
//This *should* mean "after all page scripts are run" -- so 
//including e.g. Xenforo's own draft functionality.

let mincount: Promise<number> = browser.storage.sync.get('mincount');
let fresh = true;

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
