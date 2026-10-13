import {
    FetchOptions,
    ISentenceNetworkService,
    Sentence,
    SentenceProps
} from '@rem-web/domain';
import { SentenceMapper } from '../mappers/sentence.mapper';
import { ApiResponseHandler } from '../api-response-handler';
import { toIsoString } from '../utils/date.utils';
import {
    getOneSentenceSentenceIdGet,
    getAllSentencesAllGet,
    getAllSentencesFromOneTermFromTermTermIdGet,
    createSentenceCreateModuleIdTermIdPost,
    updateSentenceEntityUpdateSentenceIdPut,
    SentenceDto
} from '../api/generated/code';

export class SentenceNetworkService implements ISentenceNetworkService {
    private readonly defaultBatchSize = 100;

    constructor(
        private readonly responseHandler: ApiResponseHandler,
        private readonly getCurrentUserUuid: () => string
    ) {}

    /**
     * Получение предложения по его UUID
     */
    public async getById(uuid: string): Promise<Sentence | null> {
        const response = await getOneSentenceSentenceIdGet({
            path: { sentence_id: uuid },
        });

        const dto = this.responseHandler.handle<SentenceDto>(response);
        return dto ? SentenceMapper.toDomain(dto, this.getCurrentUserUuid()) : null;
    }

    /**
     * Пагинированный генератор предложений для списка модулей
     */
    public async *getByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Sentence[], void, unknown> {
        if (!moduleUuids || moduleUuids.length === 0) return;

        let offset = options?.offset ?? 0;
        const limit = options?.limit  ?? this.defaultBatchSize;

        while (true) {
            const response = await getAllSentencesAllGet({
                query: {
                    module_ids: moduleUuids,
                    limit,
                    offset,
                    updated_after: toIsoString(options?.updatedAfter),
                    author_only: options?.authorOnly ?? false,
                },
            });

            const dtos = this.responseHandler.handle<SentenceDto[]>(response) ?? [];
            if (dtos.length === 0) break;

            yield dtos.map((dto) => SentenceMapper.toDomain(dto, this.getCurrentUserUuid()));

            if (dtos.length < limit) break;
            offset += limit;
        }
    }

    /**
     * Пагинированный генератор предложений для списка терминов
     */
    public async *getByTerms(
        termUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Sentence[], void, unknown> {
        if (!termUuids || termUuids.length === 0) return;

        const limit = options?.limit  ?? this.defaultBatchSize;

        for (const termUuid of termUuids) {
            let offset = options?.offset ?? 0;

            while (true) {
                const response = await getAllSentencesFromOneTermFromTermTermIdGet({
                    path: { term_id: termUuid },
                    query: {
                        limit,
                        offset,
                        updated_after: toIsoString(options?.updatedAfter),
                        author_only: options?.authorOnly ?? false,
                    },
                });

                const dtos = this.responseHandler.handle<SentenceDto[]>(response) ?? [];
                if (dtos.length === 0) break;

                yield dtos.map((dto) => SentenceMapper.toDomain(dto,  this.getCurrentUserUuid()));

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    public async *getDeleted(_options?: FetchOptions): AsyncGenerator<string[], void, unknown> {
        return;
    }

    /**
     * Создание предложения
     */
    public async create(sentence: Sentence, moduleId?: string): Promise<Sentence> {
        const targetModuleId = moduleId ?? (sentence as any).moduleId ?? '';
        const targetTermId = sentence.termUuid;

        const response = await createSentenceCreateModuleIdTermIdPost({
            path: {
                module_id: targetModuleId,
                term_id: targetTermId,
            },
            body: SentenceMapper.toCreateDto(sentence),
        });

        const dto = this.responseHandler.handle<SentenceDto>(response);
        return SentenceMapper.toDomain(dto, this.getCurrentUserUuid());
    }

    /**
     * Обновление сущности предложения
     */
    public async update(
        uuid: string,
        data: Partial<SentenceProps>
    ): Promise<Sentence> {
        const response = await updateSentenceEntityUpdateSentenceIdPut({
            path: { sentence_id: uuid },
            body: SentenceMapper.toUpdateDto(data),
        });

        const dto = this.responseHandler.handle<SentenceDto>(response);
        return SentenceMapper.toDomain(dto, this.getCurrentUserUuid());
    }

    public async delete(_uuid: string): Promise<void> {
        throw new Error('Delete operation is not supported by backend API for Sentence entity');
    }
}