let mincount = browser.storage.sync.get('mincount');

async function checkMaybeDraft(e: Event) {
    const target = (<Element>e.target);
    const draftQ = target.innerHTML;
    const charcount = target.textContent.length;

    if (charcount > await mincount) {
        composeDraft(draftQ);
    }
}

document.addEventListener('input', checkMaybeDraft);