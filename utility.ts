export namespace Utility {
    export function agnosticGetInnerHTML(e: HTMLElement) {
        if (e instanceof HTMLTextAreaElement)
            return e.value;
        else 
            return e.innerHTML; 
  }
}