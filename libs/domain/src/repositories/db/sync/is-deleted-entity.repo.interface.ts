// import { DeletedEntity, EntityType } from '../entities/deleted-entity';

import {DeletedEntity, EntityType} from "../../../entities/sync/is-deleted-entity-storage";

export interface IDeletedEntityRepository {
    /**
     * Сохранить запись об удалении (или обновить существующую)
     */
    save(entity: DeletedEntity): Promise<void>;

    /**
     * Пакетное сохранение записей (например, при каскадном удалении папки со всем содержимым)
     */
    saveBatch(entities: DeletedEntity[]): Promise<void>;

    /**
     * Получить запись по ее собственному UUID
     */
    getByUuid(uuid: string): Promise<DeletedEntity | null>;

    /**
     * Получить все удаленные сущности пользователя для отправки на сервер
     */
    getAllByUser(userUuid: string): Promise<DeletedEntity[]>;

    /**
     * Выборка удаленных сущностей конкретного типа
     */
    getByType(userUuid: string, entityType: EntityType): Promise<DeletedEntity[]>;

    /**
     * Получить записи об удалении по списку UUID удаленных сущностей (entityUuid)
     */
    getByEntityUuids(userUuid: string, entityUuids: string[]): Promise<DeletedEntity[]>;

    /**
     * Удалить записи из очереди outbox по их UUID после успешной отправки на сервер
     */
    deleteByUuids(uuids: string[]): Promise<void>;

    /**
     * Удалить запись об удалении конкретной сущности (например, если сущность восстановили до отправки)
     */
    deleteByEntityUuids(userUuid: string, entityUuids: string[]): Promise<void>;

    /**
     * Полная очистка очереди удалений пользователя (при сбросе кэша/выходе)
     */
    clearAllByUser(userUuid: string): Promise<void>;
}