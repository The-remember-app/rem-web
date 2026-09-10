import { Module } from '../../entities/module';

export interface IModuleRepository {
    getById(uuid: string, userUuid: string): Promise<Module | null>;
    getAllByUser(userUuid: string): Promise<Module[]>;
    getByFolder(rootFolderUuid: string, userUuid: string): Promise<Module[]>;
    save(module: Module): Promise<void>;
    saveBatch(modules: Module[]): Promise<void>;
    updateLearntStatus(uuid: string, userUuid: string, isLearnt: boolean): Promise<void>;
    delete(uuid: string, userUuid: string): Promise<void>;
}