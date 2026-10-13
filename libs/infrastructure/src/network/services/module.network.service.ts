// libs/infrastructure/src/network/module.network.service.ts

import {
    IModuleNetworkService,
    Module,
    SharedModule,
    SharedModuleProps,
    ModuleProps,
    FetchOptions
} from '@rem-web/domain';
import { ModuleMapper } from '../mappers/module.mapper';
import { ApiResponseHandler } from '../api-response-handler';
import { toIsoString } from '../utils/date.utils';
import {
    createModuleCreatePost,
    getOneModuleModuleIdGet,
    getModulesFromFolderFromFolderFolderIdGet,
    updateModuleEntityUpdateModuleIdPut,
    getAllModulePersonalizeAllGet,
    getOneModulePersonalizeModuleIdGet,
    getAllModulePersonalizeFromFolderFolderIdGet,
    createPersonalizeModulePersonalizeCreatePost,
    updatePersonalizeModulePersonalizeUpdateModuleIdPut
} from '../api/generated/code';
import { ModuleDto, PersonalizeModuleDto } from '../api/generated/code';

export class ModuleNetworkService implements IModuleNetworkService {
    constructor(private readonly responseHandler: ApiResponseHandler) {}

    public async getSharedById(uuid: string): Promise<SharedModule | null> {
        const res = await getOneModuleModuleIdGet({
            path: { module_id: uuid }
        });
        const dto = this.responseHandler.handle<ModuleDto>(res);
        return dto ? ModuleMapper.toSharedDomain(dto) : null;
    }

    public async getPersonalById(uuid: string): Promise<Module | null> {
        const res = await getOneModulePersonalizeModuleIdGet({
            path: { module_id: uuid }
        });
        const dto = this.responseHandler.handle<PersonalizeModuleDto>(res);
        return dto ? ModuleMapper.toPersonalDomain(dto) : null;
    }

    public async *getSharedByFolders(
        folderUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<SharedModule[], void, unknown> {
        const limit = options?.limit ?? 100;

        for (const folderUuid of folderUuids) {
            if (!folderUuid) continue;
            let offset = 0;

            while (true) {
                const res = await getModulesFromFolderFromFolderFolderIdGet({
                    path: { folder_id: folderUuid },
                    query: {
                        limit,
                        offset,
                        updated_after: toIsoString(options?.updatedAfter),
                    } as any
                });

                const dtos = this.responseHandler.handle<ModuleDto[]>(res) || [];
                if (dtos.length === 0) break;

                yield dtos.map(ModuleMapper.toSharedDomain);

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    public async *getPersonalByFolders(
        folderUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Module[], void, unknown> {
        const limit = options?.limit ?? 100;

        for (const folderUuid of folderUuids) {
            let offset = 0;

            while (true) {
                let res;
                if (folderUuid) {
                    res = await getAllModulePersonalizeFromFolderFolderIdGet({
                        path: { folder_id: folderUuid },
                        query: {
                            limit,
                            offset,
                            updated_after: toIsoString(options?.updatedAfter),
                        } as any
                    });
                } else {
                    // Если folderUuid пустой/null — запрашиваем все доступные пользователю персональные модули
                    res = await getAllModulePersonalizeAllGet({
                        query: {
                            limit,
                            offset,
                            updated_after: toIsoString(options?.updatedAfter),
                        } as any
                    });
                }

                const dtos = this.responseHandler.handle<PersonalizeModuleDto[]>(res) || [];
                if (dtos.length === 0) break;

                yield dtos.map(ModuleMapper.toPersonalDomain);

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    public async *getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown> {
        // Заглушка до реализации соответствующего эндпоинта удаленных сущностей
        yield [];
    }

    public async createShared(module: SharedModule): Promise<SharedModule> {
        const body = ModuleMapper.toCreateSharedDto(module);
        const res = await createModuleCreatePost({ body });
        const dto = this.responseHandler.handle<ModuleDto>(res);
        return ModuleMapper.toSharedDomain(dto);
    }

    public async createPersonal(module: Module): Promise<Module> {
        const body = ModuleMapper.toLinkPersonalDto(module.uuid, module.rootFolderUuid, module);
        const res = await createPersonalizeModulePersonalizeCreatePost({ body });
        const dto = this.responseHandler.handle<PersonalizeModuleDto>(res);
        return ModuleMapper.toPersonalDomain(dto);
    }

    public async linkToUser(sharedUuid: string, rootFolderUuid: string): Promise<Module> {
        const body = ModuleMapper.toLinkPersonalDto(sharedUuid, rootFolderUuid);
        const res = await createPersonalizeModulePersonalizeCreatePost({ body });
        const dto = this.responseHandler.handle<PersonalizeModuleDto>(res);
        return ModuleMapper.toPersonalDomain(dto);
    }

    public async updateShared(uuid: string, data: Partial<SharedModuleProps>): Promise<SharedModule> {
        const res = await updateModuleEntityUpdateModuleIdPut({
            path: { module_id: uuid },
            body: {
                name: data.name,
                description: data.description ?? undefined,
                root_folder_id: data.rootFolderUuid ?? undefined
            } as any
        });
        const dto = this.responseHandler.handle<ModuleDto>(res);
        return ModuleMapper.toSharedDomain(dto);
    }

    public async updatePersonal(uuid: string, data: Partial<ModuleProps>): Promise<Module> {
        const res = await updatePersonalizeModulePersonalizeUpdateModuleIdPut({
            path: { module_id: uuid },
            body: {
                root_folder_id: data.rootFolderUuid ?? undefined,
                is_reverse_definition_write: data.isReverseDefinitionWrite,
                standard_and_reverse_write: data.standardAndReverseWrite,
                is_reverse_definition_choice: data.isReverseDefinitionChoice,
                standard_and_reverse_choice: data.standardAndReverseChoice,
                max_iteration_len: data.maxIterationLen,
                min_iteration_len: data.minIterationLen,
                min_watch_count: data.minWatchCount,
                known_term_part: data.knownTermPart,
                choices_count: data.choicesCount,
                is_learnt: data.isLearnt,
            } as any
        });
        const dto = this.responseHandler.handle<PersonalizeModuleDto>(res);
        return ModuleMapper.toPersonalDomain(dto);
    }

    public async deleteShared(uuid: string): Promise<void> {
        // Будет вызывать SDK метод удаления после появления эндпоинта
    }

    public async deletePersonal(uuid: string): Promise<void> {
        // Будет вызывать SDK метод удаления после появления эндпоинта
    }
}