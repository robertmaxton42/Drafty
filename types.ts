export interface DraftRecord {
    cmpDraft: String,
    lastModified: Date,
    lastDomain: String
}

export interface ActiveRecord {
    draft: String,
    blurb: String,
    lastModified: Date,
    lastDomain: String
}

export interface ActiveDraft {
    draft: String,
    fresh: Boolean,
    lastDomain: String
}