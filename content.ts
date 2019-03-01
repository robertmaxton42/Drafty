function checkMaybeDraft(e: Event) {
    const target = (<Element>e.target);
    const draftQ = target.innerHTML;
    const charcount = target.textContent.length;

    if (charcount > mincount) {
        composeDraft(draftQ);
    }
}

document.addEventListener('input', checkMaybeDraft);