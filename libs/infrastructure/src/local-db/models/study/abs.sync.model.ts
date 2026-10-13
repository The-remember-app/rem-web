// infrastructure/src/db/schemas/db-entities.schema.ts

export interface BaseDbDocument {
    uuid: string;
    updated_at: string; // ISO String
}

export interface SyncableDbDocument extends BaseDbDocument {
    sync_state: string;
}

export interface PersSyncableDbDocument extends SyncableDbDocument {
    sync_state: string;
    personal_sync_state: string;
}