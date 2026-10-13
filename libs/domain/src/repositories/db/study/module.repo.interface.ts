import {Module, ModuleProps} from '../../../entities/study/module';
import {IBaseRepository} from "./abc";
import {Observable} from "rxjs";
import {IBasePersSyncRepository} from "../sync/abs.sync.interface";

export interface IModuleRepository extends IBaseRepository<Module, string, ModuleProps>,
    IBasePersSyncRepository<Module, string, ModuleProps> {
    getById(uuid: string, userUuid: string): Promise<Module | null>;
    getAllByUser(userUuid: string): Promise<Module[]>;
    getByFolder(rootFolderUuid: string, userUuid: string): Promise<Module[]>;
    // save(module: Module): Promise<void>;
    // saveBatch(modules: Module[]): Promise<void>;
    // updateLearntStatus(uuid: string, userUuid: string, isLearnt: boolean): Promise<void>;
    // delete(uuid: string, userUuid: string): Promise<void>;
    findByUserUuid(userUuid: string): Promise<Module[]>;
    observeByUserUuid(userUuid: string): Observable<Module[]>;
    findByRootFolderUuid(rootFolderUuid: string, userUuid: string): Promise<Module[]>;
    observeByRootFolderUuid(rootFolderUuid: string, userUuid: string): Observable<Module[]>;
    getLearnProcess(moduleUuid: string, userUuid: string): Promise<[number, number, number, number]>;
}