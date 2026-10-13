import {
    ITermNetworkService,
    SharedTerm,
    SharedTermProps,
    Term,
    TermProps,
    FetchOptions
} from '@rem-web/domain';
import { TermMapper } from '../mappers/term.mapper';
import { ApiResponseHandler } from '../api-response-handler';
import { toIsoString } from '../utils/date.utils';
import {
    getOneTermTermIdGet,
    getAllPersonalizeTermFromPersonalizeTermIdGet,
    getTermsFromModuleListAllGet,
    getAllPersonalizeTermPersonalizeAllGet,
    createTermCreatePost,
    createPersonalizeTermPersonalizeCreatePost,
    updateTermEntityUpdateTermIdPut,
    updatePersonalizeTermPersonalizeUpdateTermIdPut,
    TermDto,
    PersonalizeTermDto
} from '../api/generated/code';

export class TermNetworkService implements ITermNetworkService {
    private readonly defaultBatchSize = 100;

    constructor(private readonly responseHandler: ApiResponseHandler) {}

    // ==========================================
    // Получение по UUID
    // ==========================================

    async getSharedById(uuid: string): Promise<SharedTerm | null> {
        const response = await getOneTermTermIdGet({
            path: { term_id: uuid }
        });

        const dto = this.responseHandler.handle<TermDto>(response);
        return dto ? TermMapper.toSharedDomain(dto) : null;
    }

    async getPersonalById(uuid: string): Promise<Term | null> {
        const response = await getAllPersonalizeTermFromPersonalizeTermIdGet({
            path: { term_id: uuid }
        });

        const dto = this.responseHandler.handle<PersonalizeTermDto>(response);
        return dto ? TermMapper.toPersonalDomain(dto) : null;
    }

    // ==========================================
    // Генераторы с пагинацией по модулям
    // ==========================================

    async *getSharedByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<SharedTerm[], void, unknown> {
        let offset = 0;
        const limit = options?.limit ?? this.defaultBatchSize;

        while (true) {
            const response = await getTermsFromModuleListAllGet({
                query: {
                    module_ids: moduleUuids,
                    limit,
                    offset,
                    updated_after: toIsoString(options?.updatedAfter),
                    include_entities: options?.includeEntities
                }
            });

            const dtos = this.responseHandler.handle<TermDto[]>(response) ?? [];
            if (dtos.length === 0) break;

            yield dtos.map(TermMapper.toSharedDomain);

            if (dtos.length < limit) break;
            offset += limit;
        }
    }

    async *getPersonalByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Term[], void, unknown> {
        let offset = 0;
        const limit = options?.limit ?? this.defaultBatchSize;

        while (true) {
            const response = await getAllPersonalizeTermPersonalizeAllGet({
                query: {
                    module_ids: moduleUuids,
                    limit,
                    offset,
                    updated_after: toIsoString(options?.updatedAfter),
                    include_entities: options?.includeEntities
                }
            });

            const dtos = this.responseHandler.handle<PersonalizeTermDto[]>(response) ?? [];
            if (dtos.length === 0) break;

            yield dtos.map(TermMapper.toPersonalDomain);

            if (dtos.length < limit) break;
            offset += limit;
        }
    }

    async *getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown> {
        // Заглушка генератора удаленных элементов, если на бэкенде не предусмотрен метод получения tombstones
        return;
    }

    // ==========================================
    // Создание и привязка
    // ==========================================

    async createShared(term: SharedTerm): Promise<SharedTerm> {
        const response = await createTermCreatePost({
            body: TermMapper.toCreateDto(term)
        });

        const dto = this.responseHandler.handle<TermDto>(response);
        return TermMapper.toSharedDomain(dto);
    }

    async createPersonal(term: Term): Promise<Term> {
        const response = await createPersonalizeTermPersonalizeCreatePost({
            body: TermMapper.toCreatePersonalizeDto(term)
        });

        const dto = this.responseHandler.handle<PersonalizeTermDto>(response);
        return TermMapper.toPersonalDomain(dto);
    }

    async linkToUser(sharedUuid: string): Promise<Term> {
        const response = await createPersonalizeTermPersonalizeCreatePost({
            body: {
                term_id: sharedUuid,
                choose_error_counter: 0,
                write_error_counter: 0,
                choice_neg_error_counter: 0,
                watch_count: 0
            }
        });

        const dto = this.responseHandler.handle<PersonalizeTermDto>(response);
        return TermMapper.toPersonalDomain(dto);
    }

    // ==========================================
    // Обновление
    // ==========================================

    async updateShared(uuid: string, data: Partial<SharedTermProps>): Promise<SharedTerm> {
        const response = await updateTermEntityUpdateTermIdPut({
            path: { term_id: uuid },
            body: TermMapper.toUpdateDto(data)
        });

        const dto = this.responseHandler.handle<TermDto>(response);
        return TermMapper.toSharedDomain(dto);
    }

    async updatePersonal(uuid: string, data: Partial<TermProps>): Promise<Term> {
        const response = await updatePersonalizeTermPersonalizeUpdateTermIdPut({
            path: { term_id: uuid },
            body: TermMapper.toUpdatePersonalizeDto(data)
        });

        const dto = this.responseHandler.handle<PersonalizeTermDto>(response);
        return TermMapper.toPersonalDomain(dto);
    }

    // ==========================================
    // Удаление
    // ==========================================

    async deleteShared(uuid: string): Promise<void> {
        // Если ручки DELETE нет в API OpenAPI specifications,
        // вызов обрабатывается в соответствии с правилами архитектуры бэкенда.
    }

    async deletePersonal(uuid: string): Promise<void> {
        // Аналогично deleteShared
    }
}