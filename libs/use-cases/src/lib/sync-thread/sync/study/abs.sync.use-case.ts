// domain/src/use-cases/sync/abs.sync.use-case.ts

// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';

import {ICollisionResolverService} from "@rem-web/domain";

export interface BaseEntity {
    uuid: string;
    updatedAt: Date;
    // Флаги локального состояния (названия могут отличаться в вашей реализации)
    // isLocallyCreated?: boolean;
    // isLocallyUpdated?: boolean;
    // isStale?: boolean;
}

export interface SyncResult {
    success: boolean;
    syncedCount: number;
    error?: Error;
}

export interface ISyncStudyUseCase {
    execute(lastSyncTime?: Date): Promise<SyncResult>
}


export type UpdateScope = 'full' | 'shared' | 'personal' | 'both';

export abstract class AbsSyncUseCase<T extends BaseEntity> implements ISyncStudyUseCase {
    constructor(
        protected readonly collisionResolver: ICollisionResolverService<T>
    ) {}

    // ==========================================
    // АБСТРАКТНЫЕ МЕТОДЫ (Обязатлеьные для реализации)
    // ==========================================

    // Получение данных
    protected abstract fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<T[], void, unknown>;
    protected abstract fetchLocalEntitiesByUuids(uuids: string[]): Promise<T[]>;
    protected abstract fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown>;
    protected abstract fetchSingleServerEntity(uuid: string): Promise<T>;

    // Работа с локальной БД
    protected abstract saveLocally(entities: T[]): Promise<void>;
    protected abstract hardOverwriteLocally(serverEntities: T[]): Promise<void>;
    protected abstract deleteLocallyCascading(uuid: string): Promise<void>;
    protected abstract checkLocalExists(uuid: string): Promise<boolean>;

    // Локальные состояния
    protected abstract getLocallyCreated(): Promise<T[]>;
    protected abstract getLocallyModified(): Promise<T[]>;
    protected abstract getStaleEntities(): Promise<T[]>;

    // Отправка на сервер
    protected abstract sendCreateToServer(entity: T): Promise<T>;

    /**
     * Основной метод обновления (используется, если scope === 'full').
     * Для сущностей с разделением может просто выбрасывать ошибку, т.к. не должен вызываться.
     */
    protected abstract sendUpdateToServer(entity: T): Promise<T>;

    // ==========================================
    // ВИРТУАЛЬНЫЕ МЕТОДЫ (Можно переопределить)
    // ==========================================

    /**
     * Определяет, какая часть сущности была изменена локально.
     * По умолчанию возвращает 'full' (обновление целиком).
     */
    protected async determineUpdateScope(entity: T): Promise<UpdateScope> {
        return 'full';
    }

    /**
     * Отправка обновлений только общей части.
     * Переопределяется в сущностях, где есть разделение.
     */
    protected async sendSharedUpdateToServer(entity: T): Promise<T> {
        throw new Error('Метод sendSharedUpdateToServer не реализован для этой сущности');
    }

    /**
     * Отправка обновлений только персональной части.
     * Переопределяется в сущностях, где есть разделение.
     */
    protected async sendPersonalUpdateToServer(entity: T): Promise<T> {
        throw new Error('Метод sendPersonalUpdateToServer не реализован для этой сущности');
    }

    // ==========================================
    // ОРКЕСТРАТОР СИНХРОНИЗАЦИИ
    // ==========================================

    public async execute(lastSyncTime?: Date): Promise<SyncResult> {
        // Карта для аккумулирования сущностей с локальными изменениями (список 3)
        const accumulatedLocalModifications: Map<string, T> = new Map();
        try {
            let res = await this.syncFromServerBatches(lastSyncTime, accumulatedLocalModifications);
            if (!res.success) {
                return res
            }
            res = await this.pushLocalCreations();
            if (!res.success) {
                return res
            }
            res = await this.pushLocalModifications(accumulatedLocalModifications);
            if (!res.success) {
                return res
            }
            res = await this.recoverStaleEntities();
            if (!res.success) {
                return res
            }
            res = await this.handleServerDeletions(lastSyncTime);
            if (!res.success) {
                return res
            }
            return {
                success: true,
                syncedCount: 0,
            }
        } catch (error) {
            // console.error(`Ошибка при обновлении сущности ${uuid} на сервере:`, error);
            // await this.markEntityAsStale(entity);
            return {
                success: false,
                syncedCount: 0,
                // error: error,
            }
        }

    }

    // ==========================================
    // ЭТАПЫ СИНХРОНИЗАЦИИ (Можно переопределять)
    // ==========================================

    /**
     * ЭТАП 1: Получение данных с сервера и разрешение коллизий
     */
    protected async syncFromServerBatches(
        lastSyncTime: Date | undefined,
        accumulatedLocalModifications: Map<string, T>
    ): Promise<SyncResult> {
        for await (const serverBatch of this.fetchServerEntitiesBatches(lastSyncTime)) {
            const serverUuids = serverBatch.map(e => e.uuid);
            const localMatches = await this.fetchLocalEntitiesByUuids(serverUuids);

            const resolved = this.collisionResolver.resolveBatches(serverBatch, localMatches);

            // 1 и 2: сохраняем новые и обновленные сущности
            if (resolved.newEntities.length > 0 || resolved.updatedEntities.length > 0) {
                await this.saveLocally([...resolved.newEntities, ...resolved.updatedEntities]);
            }

            // 5: жесткая перезапись для ошибок разрешения коллизий
            if (resolved.errorEntities.length > 0) {
                await this.hardOverwriteLocally(resolved.errorEntities);
            }

            // 3: аккумулируем локальные изменения для отправки на сервер
            resolved.localModifications.forEach(entity => {
                accumulatedLocalModifications.set(entity.uuid, entity);
            });
        }
        return {
            success: true,
            syncedCount: 0,
        }
    }

    /**
     * ЭТАП 2: Отправка локально созданных сущностей
     */
    protected async pushLocalCreations(): Promise<SyncResult> {
        const locallyCreated = await this.getLocallyCreated();

        for (const entity of locallyCreated) {
            try {
                const serverResponse = await this.sendCreateToServer(entity);
                await this.resolveAndSaveUpdate(serverResponse, entity);
            } catch (error) {
                console.error(`Ошибка при создании сущности ${entity.uuid} на сервере:`, error);
                await this.markEntityAsStale(entity);
            }
        }
        return {
            success: true,
            syncedCount: 0,
        }
    }

    /**
     * ЭТАП 3: Отправка локально измененных сущностей (с учетом разделения shared/personal)
     */
    protected async pushLocalModifications(accumulatedLocalModifications: Map<string, T>): Promise<SyncResult> {
        // Добавляем к аккумулированным сущностям те, что просто лежат в БД с флагом "изменено"
        const locallyModifiedFromDb = await this.getLocallyModified();
        locallyModifiedFromDb.forEach(entity => {
            accumulatedLocalModifications.set(entity.uuid, entity);
        });

        for (const [uuid, entity] of accumulatedLocalModifications.entries()) {
            try {
                await this.processSingleModification(entity);
            } catch (error) {
                console.error(`Ошибка при обновлении сущности ${uuid} на сервере:`, error);
                await this.markEntityAsStale(entity);
            }
        }
        return {
            success: true,
            syncedCount: 0,
        }
    }

    /**
     * ЭТАП 4: Восстановление устаревших (stale) сущностей
     */
    protected async recoverStaleEntities(): Promise<SyncResult> {
        const staleEntities = await this.getStaleEntities();

        for (const staleEntity of staleEntities) {
            try {
                const actualServerEntity = await this.fetchSingleServerEntity(staleEntity.uuid);
                const status = this.collisionResolver.resolveSingle(actualServerEntity, staleEntity);

                if (status !== 'errorEntities') {
                    await this.saveLocally([actualServerEntity]);
                } else {
                    await this.hardOverwriteLocally([actualServerEntity]);
                }
            } catch (error) {
                console.error(`Не удалось восстановить устаревшую сущность ${staleEntity.uuid}`, error);
            }
        }
        return {
            success: true,
            syncedCount: 0,
        }
    }

    /**
     * ЭТАП 5: Удаление сущностей, удаленных на сервере
     */
    protected async handleServerDeletions(lastSyncTime?: Date): Promise<SyncResult> {
        for await (const deletedUuidsBatch of this.fetchDeletedUuidsFromServer(lastSyncTime)) {
            for (const uuid of deletedUuidsBatch) {
                const exists = await this.checkLocalExists(uuid);
                if (exists) {
                    await this.deleteLocallyCascading(uuid);
                }
            }
        }
        return {
            success: true,
            syncedCount: 0,
        }
    }

    // ==========================================
    // ВСПОМОГАТЕЛЬНЫЕ ВНУТРЕННИЕ МЕТОДЫ
    // ==========================================

    /**
     * Обработка обновления одной сущности с учетом области изменений (Scope)
     */
    protected async processSingleModification(entity: T): Promise<void> {
        const scope = await this.determineUpdateScope(entity);

        if (scope === 'full') {
            const response = await this.sendUpdateToServer(entity);
            await this.resolveAndSaveUpdate(response, entity);
        }
        else if (scope === 'shared') {
            const response = await this.sendSharedUpdateToServer(entity);
            await this.resolveAndSaveUpdate(response, entity);
        }
        else if (scope === 'personal') {
            const response = await this.sendPersonalUpdateToServer(entity);
            await this.resolveAndSaveUpdate(response, entity);
        }
        else if (scope === 'both') {
            // 1. Сначала обновляем общую (shared) часть
            const sharedResponse = await this.sendSharedUpdateToServer(entity);

            // Проверяем коллизии после обновления общей части
            const afterSharedStatus = this.collisionResolver.resolveSingle(sharedResponse, entity);

            if (afterSharedStatus === 'updatedEntities' || afterSharedStatus === 'unchangedEntities') {
                // Сохраняем промежуточный результат с актуальными данными сервера
                await this.saveLocally([sharedResponse]);

                // 2. Затем обновляем персональную (personal) часть, опираясь на ответ сервера
                const personalResponse = await this.sendPersonalUpdateToServer(sharedResponse);
                await this.resolveAndSaveUpdate(personalResponse, sharedResponse);
            } else {
                // Если возникла коллизия при обновлении общей части, метим как устаревшую
                await this.markEntityAsStale(entity);
            }
        }
    }

    /**
     * Разрешает коллизию для единственного ответа от сервера и сохраняет результат
     */
    protected async resolveAndSaveUpdate(serverResponse: T, localEntity: T): Promise<void> {
        const resolutionStatus = this.collisionResolver.resolveSingle(serverResponse, localEntity);

        if (resolutionStatus === 'updatedEntities' || resolutionStatus === 'unchangedEntities') {
            await this.saveLocally([serverResponse]);
        } else {
            await this.markEntityAsStale(localEntity);
        }
    }

    /**
     * Помечает сущность как устаревшую (Stale) при ошибках синхронизации
     */
    protected async markEntityAsStale(entity: T): Promise<void> {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        entity.updatedAt = oneYearAgo;

        // Если в вашей реализации есть специальный флаг (например isStale), установите его здесь:
        // entity.isStale = true;

        await this.saveLocally([entity]);
        console.error(`Сущность ${entity.uuid} помечена как устаревшая из-за ошибки синхронизации.`);
    }
}