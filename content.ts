import { DraftRecord, ActiveDraft, ActiveRecord } from './types';

//Offscreen logic: content.js ought to run when page is idle.
//This *should* mean "after all page scripts are run" -- so 
//including e.g. Xenforo's own draft functionality.

let mincount = browser.storage.sync.get('mincount');
let fresh = true;

async function checkMaybeDraft(e: Element) {
    let draftQ, charcount;
    if (e instanceof HTMLTextAreaElement) {
        draftQ = e.textContent;
        charcount = e.textContent.length;
    } else if (e instanceof HTMLElement && e.contentEditable !== "false") {
        draftQ = e.innerHTML;
        charcount = e.textContent.length;
    }

    if (charcount > await mincount) {
        composeDraft(draftQ);
    }
}

function composeDraft(draft: String) : ActiveDraft {
    return {
        draft: draft,
        fresh: fresh,
        lastDomain: window.location
    }
}

document.addEventListener('input', );