// import {Folder} from "@rem-web/domain";

// Общий базовый CRUD-интерфейс
import {Observable} from "rxjs";

export interface IBaseSyncRepository<T, PK, TProps> {
    getLocallyCreated(): Promise<T[]>;

    getLocallyModified(): Promise<T[]>;

    getWithServerChanges(): Promise<T[]>; // Замена устаревшего getStale

    getUpdating(): Promise<T[]>; // для syncing_to_server и syncing_from_server
    getWithSyncErrors(): Promise<T[]>;

    observeLocallyCreated(): Observable<T | null>;
    observeLocallyModified(): Observable<T | null>;
}

export interface IBasePersSyncRepository<T, PK, TProps> extends IBaseSyncRepository<T, PK, TProps> {
    getPersLocallyCreated(): Promise<T[]>;

    getPersLocallyModified(): Promise<T[]>;

    getPersWithServerChanges(): Promise<T[]>; // Замена устаревшего getStale

    getPersUpdating(): Promise<T[]>; // для syncing_to_server и syncing_from_server
    getPersWithSyncErrors(): Promise<T[]>;

    observePersLocallyCreated(): Observable<T | null>;
    observePersLocallyModified(): Observable<T | null>;
}