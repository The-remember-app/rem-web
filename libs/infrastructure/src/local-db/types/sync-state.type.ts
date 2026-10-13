export type SyncState =
    | 'synced'
    | 'created'
    | 'modified'
    | 'stale'
    | 'syncing_to_server'
    | 'syncing_from_server'
    | 'error';