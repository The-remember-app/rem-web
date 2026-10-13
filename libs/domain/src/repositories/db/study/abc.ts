import { Observable } from 'rxjs';
// import {Folder} from "@rem-web/domain";

// Общий базовый CRUD-интерфейс
export interface IBaseRepository<T, PK, TProps> {
    save(entity: T): Promise<void>;
    upsert(entity: T): Promise<void>;
    update(pk: PK, data: Partial<T>): Promise<void>;
    delete(pk: PK): Promise<void>;

    saveBatch(entity: T[]): Promise<void>;
    upsertBatch(entity: T[]): Promise<void>;
    updateBatch(entity: T[]): Promise<void>;
    deleteBatch(entity: T[]): Promise<void>;

    findByPk(pk: PK): Promise<T | null>;
    findByPks(pks: PK[]): Promise<T[]>;
    observeByPk(pk: PK): Observable<T | null>;
    observeByPks(pk: PK[]): Observable<T | null>;

    toDomain(doc: any): T
    toDocument(entity: T): Record<string, any>

    // 2. Проверка существования сущности в БД
    exists(pk: PK): Promise<boolean>;

    // 5. Каскадное / Рекурсивное удаление сущности и всех её зависимостей из БД
    deleteCascading(pk: PK): Promise<void>;


}