import {Folder, FolderProps} from '../../../entities/study/folder';
import {IBaseRepository} from "./abc";
import {Observable} from "rxjs";
import {IBasePersSyncRepository} from "../sync/abs.sync.interface";

export interface IFolderRepository extends
    IBaseRepository<Folder, string, FolderProps>,
    IBasePersSyncRepository<Folder, string, FolderProps>
{
    getById(uuid: string, userUuid: string): Promise<Folder | null>;
    getAllByUser(userUuid: string): Promise<Folder[]>;
    getByParentFolder(rootFolderUuid: string, userUuid: string): Promise<Folder[]>;
    // saveBatch(folders: Folder[]): Promise<void>;
    findByUserUuid(userUuid: string): Promise<Folder[]>;
    observeByUserUuid(userUuid: string): Observable<Folder[]>;
    findByRootFolderUuid(rootFolderUuid: string | null, userUuid: string): Promise<Folder[]>;
    observeByRootFolderUuid(rootFolderUuid: string | null, userUuid: string): Observable<Folder[]>;
    findByAuthorUuid(authorUuid: string): Promise<Folder[]>;
}