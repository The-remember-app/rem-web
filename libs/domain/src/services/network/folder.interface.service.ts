import {Folder, FolderProps, SharedFolder, SharedFolderProps} from '../../entities/study/folder';
// import { SharedFolder, SharedFolderProps } from '../../entities/shared-folder';
import { FetchOptions } from './fetch-options';

export interface IFolderNetworkService {
    // Получение по UUID
    getSharedById(uuid: string): Promise<SharedFolder | null>;
    getPersonalById(uuid: string): Promise<Folder | null>;

    // Получение потомков (принимает список родительских UUID)
    getSharedChildren(
        parentUuids: (string | null)[],
        options?: FetchOptions
    ): AsyncGenerator<SharedFolder[], void, unknown>;

    getPersonalChildren(
        parentUuids: (string | null)[],
        options?: FetchOptions
    ): AsyncGenerator<Folder[], void, unknown>;

    getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown>;

    // Создание и привязка
    createShared(folder: SharedFolder): Promise<SharedFolder>;
    createPersonal(folder: Folder): Promise<Folder>;
    linkToUser(sharedUuid: string, rootFolderUuid?: string | null): Promise<Folder>;

    // Обновление
    updateShared(uuid: string, data: Partial<SharedFolderProps>): Promise<SharedFolder>;
    updatePersonal(uuid: string, data: Partial<FolderProps>): Promise<Folder>;

    // Удаление
    deleteShared(uuid: string): Promise<void>;
    deletePersonal(uuid: string): Promise<void>;
}
