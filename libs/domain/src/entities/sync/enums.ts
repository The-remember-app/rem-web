// domain/src/enums/sync-state.enum.ts

export type SyncState =
    | 'synced'              // Синхронизировано с сервером
    | 'locally_created'     // Создано локально, ожидает отправки
    | 'locally_updated'     // Изменено локально, ожидает отправки
    | 'has_server_changes'  // На сервере есть изменения, требующие разрешения (замена stale/conflict)
    | 'syncing_to_server'   // В процессе отправки на сервер
    | 'syncing_from_server' // В процессе скачивания/применения с сервера
    | 'error';              // Ошибка при последней попытке синхронизации
