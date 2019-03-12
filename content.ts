import { DraftRecord, ActiveDraft, ActiveRecord } from './types';
import * as $ from 'jquery'

//Offscreen logic: content.js ought to run when page is idle.
//This *should* mean "after all page scripts are run" -- so 
//including e.g. Xenforo's own draft functionality.

let mincount: Promise<number> = browser.storage.sync.get('mincount');
let fresh = true;

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

async function freshScan() {
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
