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
    draft: String,
    fresh: Boolean,
    lastDomain: Location
}