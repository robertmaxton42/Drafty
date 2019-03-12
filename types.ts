export interface DraftRecord {
    cmpDraft: String,
    lastModified: Date,
    lastDomain: Location
}

export interface ActiveRecord {
    draft: String,
    blurb: String,
    lastModified: Date,
    lastDomain: Location
}

export interface ActiveDraft {
    oldDraft: String,
    diff: String,
    lastDomain: Location,
    slot: number
}