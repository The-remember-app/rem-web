import {
    IFolderNetworkService,
    Folder,
    SharedFolder,
    SharedFolderProps,
    FolderProps,
    FetchOptions
} from '@rem-web/domain';
import { FolderMapper } from '../mappers/folder.mapper';
import {
    getOneFolderFolderIdGet,
    getPersonalizeFolderPersonalizeFolderIdGet,
    getPersonalizeSubFoldersPersonalizeFolderIdSubFoldersGet,
    getSubFoldersFolderIdSubFoldersGet,
    getAllFoldersPersonalizeAllGet,
    createFolderCreatePost,
    createPersonalizeFolderPersonalizeCreatePost,
    updateFolderEntityUpdateFolderIdPut,
    updatePersonalizeFolderPersonalizeUpdateFolderIdPut
} from '../api/generated/code';
import { FolderDto, PersonalizeFolderDto } from '../api/generated/code';
import { ApiResponseHandler } from "../api-response-handler";
import {toIsoString} from "../utils/date.utils";


export class FolderNetworkService implements IFolderNetworkService {
    constructor(private readonly responseHandler: ApiResponseHandler) {}

    public async getSharedById(uuid: string): Promise<SharedFolder | null> {
        const res = await getOneFolderFolderIdGet({
            path: { folder_id: uuid }
        });
        const dto = this.responseHandler.handle<FolderDto>(res);
        return dto ? FolderMapper.toSharedDomain(dto) : null;
    }

    public async getPersonalById(uuid: string): Promise<Folder | null> {
        const res = await getPersonalizeFolderPersonalizeFolderIdGet({
            path: { folder_id: uuid }
        });
        const dto = this.responseHandler.handle<PersonalizeFolderDto>(res);
        return dto ? FolderMapper.toPersonalDomain(dto) : null;
    }

    public async *getSharedChildren(
        parentUuids: (string | null)[],
        options?: FetchOptions
    ): AsyncGenerator<SharedFolder[], void, unknown> {
        const limit = options?.limit ?? 100;

        for (const parentUuid of parentUuids) {
            if (!parentUuid) continue;
            let offset = 0;

            while (true) {
                const res = await getSubFoldersFolderIdSubFoldersGet({
                    path: { folder_id: parentUuid },
                    query: {
                        limit,
                        offset,
                        updated_after: toIsoString(options?.updatedAfter),
                    } as any
                });

                const dtos = this.responseHandler.handle<FolderDto[]>(res) || [];
                if (dtos.length === 0) break;

                yield dtos.map(FolderMapper.toSharedDomain);

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    public async *getPersonalChildren(
        parentUuids: (string | null)[],
        options?: FetchOptions
    ): AsyncGenerator<Folder[], void, unknown> {
        const limit = options?.limit ?? 100;

        for (const parentUuid of parentUuids) {
            let offset = 0;

            while (true) {
                let res;
                if (parentUuid) {
                    res = await getPersonalizeSubFoldersPersonalizeFolderIdSubFoldersGet({
                        path: { folder_id: parentUuid },
                        query: {
                            limit,
                            offset,
                            updated_after: toIsoString(options?.updatedAfter),
                        } as any
                    });
                } else {
                    // Если parentUuid === null, запрашиваем корневые/все персональные папки
                    res = await getAllFoldersPersonalizeAllGet({
                        query: {
                            limit,
                            offset,
                            updated_after: toIsoString(options?.updatedAfter),
                        } as any
                    });
                }

                const dtos = this.responseHandler.handle<PersonalizeFolderDto[]>(res) || [];
                if (dtos.length === 0) break;

                yield dtos.map(FolderMapper.toPersonalDomain);

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    public async *getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown> {
        // Реализация получения удаленных сущностей при наличии соответствующего endpoint в SDK
        yield [];
    }

    public async createShared(folder: SharedFolder): Promise<SharedFolder> {
        const body = FolderMapper.toCreateSharedDto(folder);
        const res = await createFolderCreatePost({ body });
        const dto = this.responseHandler.handle<FolderDto>(res);
        return FolderMapper.toSharedDomain(dto);
    }

    public async createPersonal(folder: Folder): Promise<Folder> {
        const body = FolderMapper.toLinkPersonalDto(folder.uuid, folder.rootFolderUuid);
        const res = await createPersonalizeFolderPersonalizeCreatePost({ body });
        const dto = this.responseHandler.handle<PersonalizeFolderDto>(res);
        return FolderMapper.toPersonalDomain(dto);
    }

    public async linkToUser(sharedUuid: string, rootFolderUuid?: string | null): Promise<Folder> {
        const body = FolderMapper.toLinkPersonalDto(sharedUuid, rootFolderUuid);
        const res = await createPersonalizeFolderPersonalizeCreatePost({ body });
        const dto = this.responseHandler.handle<PersonalizeFolderDto>(res);
        return FolderMapper.toPersonalDomain(dto);
    }

    public async updateShared(uuid: string, data: Partial<SharedFolderProps>): Promise<SharedFolder> {
        const res = await updateFolderEntityUpdateFolderIdPut({
            path: { folder_id: uuid },
            body: {
                name: data.name,
                root_folder_id: data.rootFolderUuid ?? undefined
            } as any
        });
        const dto = this.responseHandler.handle<FolderDto>(res);
        return FolderMapper.toSharedDomain(dto);
    }

    public async updatePersonal(uuid: string, data: Partial<FolderProps>): Promise<Folder> {
        const res = await updatePersonalizeFolderPersonalizeUpdateFolderIdPut({
            path: { folder_id: uuid },
            body: {
                root_folder_id: data.rootFolderUuid ?? undefined
            } as any
        });
        const dto = this.responseHandler.handle<PersonalizeFolderDto>(res);
        return FolderMapper.toPersonalDomain(dto);
    }

    public async deleteShared(uuid: string): Promise<void> {
        // Метод удаления вызовет соответствующий SDK эндпоинт при его наличии
    }

    public async deletePersonal(uuid: string): Promise<void> {
        // Метод удаления вызовет соответствующий SDK эндпоинт при его наличии
    }
}
