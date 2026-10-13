// domain/src/use-cases/sync/folder-sync.use-case.ts

import { AbsSyncUseCase, UpdateScope } from '../abs.sync.use-case';
// import { Folder, FolderProps } from '../../entities/folder';
// import { IFolderNetworkService } from '../../services/network/folder.interface.service';
// import { IFolderRepository } from '../../repositories/folder.repo.interface';
// import { ICollisionResolverService } from '../../services/collision/collision-resolver.interface.service';
import { TreeSortUtil } from '../../../../utils/tree-sort.util';
import {Folder, ICollisionResolverService, IFolderNetworkService, IFolderRepository} from "@rem-web/domain";

export class FolderSyncUseCase extends AbsSyncUseCase<Folder> {
    constructor(
        // private readonly userUuid: string,
        private readonly folderNetworkService: IFolderNetworkService,
        private readonly folderRepository: IFolderRepository,
        collisionResolver: ICollisionResolverService<Folder>
    ) {
        super(collisionResolver);
    }

    // --- Сетевые методы ---

    protected fetchServerEntitiesBatches(lastSyncTime?: Date): AsyncGenerator<Folder[], void, unknown> {
        // Передаем rootFolderUuids = [null] для корня или null для получения всех веток
        return this.folderNetworkService.getPersonalChildren([null], { updatedAfter: lastSyncTime });
    }

    protected async *fetchDeletedUuidsFromServer(lastSyncTime?: Date): AsyncGenerator<string[], void, unknown> {
        // Заглушка до реализации метода в API
        yield [];
    }

    protected async fetchSingleServerEntity(uuid: string): Promise<Folder> {
        const folder = await this.folderNetworkService.getPersonalById(uuid);
        if (!folder) throw new Error(`Папка ${uuid} не найдена на сервере`);
        return folder;
    }

    // --- Работа с локальной БД (с защитой Foreign Key) ---

    protected fetchLocalEntitiesByUuids(uuids: string[]): Promise<Folder[]> {
        return this.folderRepository.findByPks(uuids);
    }

    protected async saveLocally(entities: Folder[]): Promise<void> {
        if (entities.length === 0) return;

        // Сортируем: сначала родители, потом дети, чтобы не нарушать FK
        const sortedFolders = TreeSortUtil.sortTopologicallyParentFirst(
            entities,
            (f) => f.rootFolderUuid
        );

        try {
            await this.folderRepository.upsertBatch(sortedFolders);
        } catch (dbError) {
            console.error('[FolderSync] Ошибка сохранения папок в БД (возможен конфликт FK):', dbError);
            // Фолбэк: поочередное сохранение
            for (const folder of sortedFolders) {
                try {
                    await this.folderRepository.upsert(folder);
                } catch (e) {
                    console.error(`[FolderSync] Не удалось сохранить папку ${folder.uuid}:`, e);
                }
            }
        }
    }

    protected async hardOverwriteLocally(serverEntities: Folder[]): Promise<void> {
        // Удаляем снизу вверх (дети -> родители)
        const childFirst = TreeSortUtil.sortTopologicallyChildFirst(
            serverEntities,
            (f) => f.rootFolderUuid
        );

        for (const folder of childFirst) {
            await this.folderRepository.deleteCascading(folder.uuid);
        }

        // Вставляем сверху вниз (родители -> дети)
        await this.saveLocally(serverEntities);
    }

    protected deleteLocallyCascading(uuid: string): Promise<void> {
        return this.folderRepository.deleteCascading(uuid);
    }

    protected checkLocalExists(uuid: string): Promise<boolean> {
        return this.folderRepository.exists(uuid);
    }

    // --- Локальные состояния ---

    protected getLocallyCreated(): Promise<Folder[]> {
        return this.folderRepository.getLocallyCreated();
    }

    protected getLocallyModified(): Promise<Folder[]> {
        return this.folderRepository.getLocallyModified();
    }

    protected getStaleEntities(): Promise<Folder[]> {
        return this.folderRepository.getWithServerChanges();
    }

    // --- Разделение Общей и Персональной части ---

    protected override async determineUpdateScope(entity: Folder): Promise<UpdateScope> {
        const isSharedChanged = (entity as any).isSharedLocallyUpdated;
        const isPersonalChanged = (entity as any).isPersonalLocallyUpdated;

        if (isSharedChanged && isPersonalChanged) return 'both';
        if (isSharedChanged) return 'shared';
        if (isPersonalChanged) return 'personal';
        return 'full';
    }

    protected async sendCreateToServer(entity: Folder): Promise<Folder> {
        return await this.folderNetworkService.createPersonal(entity);
    }

    protected async sendUpdateToServer(entity: Folder): Promise<Folder> {
        return await this.folderNetworkService.updatePersonal(entity.uuid, entity);
    }

    protected override async sendSharedUpdateToServer(entity: Folder): Promise<Folder> {
        const updatedShared = await this.folderNetworkService.updateShared(entity.uuid, entity as any);
        // Приводим результат к типу Folder
        return updatedShared as unknown as Folder;
    }

    protected override async sendPersonalUpdateToServer(entity: Folder): Promise<Folder> {
        return await this.folderNetworkService.updatePersonal(entity.uuid, entity);
    }
}