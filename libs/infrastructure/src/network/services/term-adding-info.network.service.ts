import {
    FetchOptions,
    ITermAddingInfoNetworkService,
    TermAddingInfo,
    TermAddingInfoProps
} from '@rem-web/domain';
import { TermAddingInfoMapper } from '../mappers/term-adding-info.mapper';
import { ApiResponseHandler } from '../api-response-handler';
import { toIsoString } from '../utils/date.utils';
import {
    getAllAddTermInfoAllGet,
    getAllAddTermInfoFromModuleFromTermTermIdGet,
    createTermCreateModuleIdTermIdPost,
    updateAdditionalInfoEntityUpdateAddInfoIdPut,
    AdditionalTermInfoDto
} from '../api/generated/code';
// import {SentenceMapper} from "../mappers/sentence.mapper";

export class TermAddingInfoNetworkService implements ITermAddingInfoNetworkService {
    private readonly defaultBatchSize = 100;

    constructor(
        private readonly responseHandler: ApiResponseHandler,
        private readonly getCurrentUserUuid: () => string
    ) {}

    /**
     * Запросить точечно доп. инфу по UUID (через общую фильтрацию include_entities)
     */
    public async getById(uuid: string): Promise<TermAddingInfo | null> {
        const response = await getAllAddTermInfoAllGet({
            query: {
                include_entities: [uuid],
                limit: 1,
            },
        });

        const dtos = this.responseHandler.handle<AdditionalTermInfoDto[]>(response) ?? [];
        const dto = dtos.find((item) => item.id === uuid);

        return dto ? TermAddingInfoMapper.toDomain(dto, this.getCurrentUserUuid()) : null;
    }

    /**
     * Получить доп. инфу по списку модулей
     */
    public async *getByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<TermAddingInfo[], void, unknown> {
        if (!moduleUuids || moduleUuids.length === 0) return;

        let offset = options?.offset ?? 0;
        const limit = options?.limit  ?? this.defaultBatchSize;

        while (true) {
            const response = await getAllAddTermInfoAllGet({
                query: {
                    module_ids: moduleUuids,
                    limit,
                    offset,
                    updated_after: toIsoString(options?.updatedAfter),
                    author_only: options?.authorOnly ?? false,
                },
            });

            const dtos = this.responseHandler.handle<AdditionalTermInfoDto[]>(response) ?? [];
            if (dtos.length === 0) break;

            yield dtos.map((dto) => TermAddingInfoMapper.toDomain(dto, this.getCurrentUserUuid()));

            if (dtos.length < limit) break;
            offset += limit;
        }
    }

    /**
     * Получить доп. инфу по списку терминов
     */
    public async *getByTerms(
        termUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<TermAddingInfo[], void, unknown> {
        if (!termUuids || termUuids.length === 0) return;

        const limit = options?.limit ?? this.defaultBatchSize;

        for (const termUuid of termUuids) {
            let offset = options?.offset ?? 0;

            while (true) {
                const response = await getAllAddTermInfoFromModuleFromTermTermIdGet({
                    path: { term_id: termUuid },
                    query: {
                        limit,
                        offset,
                        updated_after: toIsoString(options?.updatedAfter),
                        author_only: options?.authorOnly ?? false,
                    },
                });

                const dtos = this.responseHandler.handle<AdditionalTermInfoDto[]>(response) ?? [];
                if (dtos.length === 0) break;

                yield dtos.map((dto) => TermAddingInfoMapper.toDomain(dto, this.getCurrentUserUuid()));

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    /**
     * Фильтрация родительских сущностей на клиенте
     */
    public async *getByParents(
        parentInfoUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<TermAddingInfo[], void, unknown> {
        if (!parentInfoUuids || parentInfoUuids.length === 0) return;

        const parentSet = new Set(parentInfoUuids);

        for await (const batch of this.getByModules([], options)) {
            const filtered = batch.filter((item) => parentSet.has(item.parentAddInfoUuid));
            if (filtered.length > 0) {
                yield filtered;
            }
        }
    }

    public async *getDeleted(_options?: FetchOptions): AsyncGenerator<string[], void, unknown> {
        return;
    }

    /**
     * Создание записи доп. информации
     */
    public async create(info: TermAddingInfo): Promise<TermAddingInfo> {
        const targetModuleId = (info as any).moduleId ?? '';

        const response = await createTermCreateModuleIdTermIdPost({
            path: {
                module_id: targetModuleId,
                term_id: info.termUuid,
            },
            body: TermAddingInfoMapper.toCreateDto(info),
        });

        const dto = this.responseHandler.handle<AdditionalTermInfoDto>(response);
        return TermAddingInfoMapper.toDomain(dto, this.getCurrentUserUuid());
    }

    /**
     * Обновление записи доп. информации
     */
    public async update(
        uuid: string,
        data: Partial<TermAddingInfoProps>
    ): Promise<TermAddingInfo> {
        const response = await updateAdditionalInfoEntityUpdateAddInfoIdPut({
            path: { add_info_id: uuid },
            body: TermAddingInfoMapper.toUpdateDto(data),
        });

        const dto = this.responseHandler.handle<AdditionalTermInfoDto>(response);
        return TermAddingInfoMapper.toDomain(dto, this.getCurrentUserUuid());
    }

    public async delete(_uuid: string): Promise<void> {
        throw new Error('Delete operation is not supported for TermAddingInfo');
    }
}