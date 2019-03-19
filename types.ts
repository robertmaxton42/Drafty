export namespace Types {
    export interface DraftRecord {
        cmpDraft: string,
        lastModified: Date,
        lastDomain: Location
    }

    export interface ActiveRecord {
        draft: string,
        blurb: string,
        lastModified: Date,
        lastDomain: Location
    }

    export interface ActiveDraft {
        oldDraft: string,
        diff: string,
        lastDomain: Location,
        slot: number
    }

    export enum PatchType { Deletion = -1, Identity, Insertion, Transposition }

    export interface PatchFold {
        cursor: number,
        patchlist: Array<[
            PatchType, 
            number, //cursor position
            number | string | Transposition //del char count | ins chars | trans obj
        ]>
    }
    export interface Transposition {
        chars: number,
        from: number,
        to: number
    }

    export interface CachedDelta {
        original: string,
        delta: string
    }
}