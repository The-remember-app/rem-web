import {Module, ModuleProps, SharedModule, SharedModuleProps} from '../../entities/study/module';
// import { SharedModule, SharedModuleProps } from '../../entities/shared-module';
import { FetchOptions } from './fetch-options';

export interface IModuleNetworkService {
    // Получение по UUID
    getSharedById(uuid: string): Promise<SharedModule | null>;
    getPersonalById(uuid: string): Promise<Module | null>;

    // Получение потомков для родительских папок
    getSharedByFolders(
        folderUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<SharedModule[], void, unknown>;

    getPersonalByFolders(
        folderUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Module[], void, unknown>;

    getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown>;

    // Создание и привязка
    createShared(module: SharedModule): Promise<SharedModule>;
    createPersonal(module: Module): Promise<Module>;
    linkToUser(sharedUuid: string, rootFolderUuid: string): Promise<Module>;

    // Обновление
    updateShared(uuid: string, data: Partial<SharedModuleProps>): Promise<SharedModule>;
    updatePersonal(uuid: string, data: Partial<ModuleProps>): Promise<Module>;

    // Удаление
    deleteShared(uuid: string): Promise<void>;
    deletePersonal(uuid: string): Promise<void>;
}
