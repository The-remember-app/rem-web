import { Folder } from '../../entities/folder';

export interface IFolderRepository {
    getById(uuid: string, userUuid: string): Promise<Folder | null>;
    getAllByUser(userUuid: string): Promise<Folder[]>;
    getByParentFolder(rootFolderUuid: string, userUuid: string): Promise<Folder[]>;
    save(folder: Folder): Promise<void>;
    saveBatch(folders: Folder[]): Promise<void>;
    delete(uuid: string, userUuid: string): Promise<void>;
}