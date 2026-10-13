import {
    FetchOptions,
    ILearnTermDatetimeMarkNetworkService,
    LearnTermDatetimeMark,
    LearnTermDatetimeMarkProps
} from '@rem-web/domain';
import { LearnTermDatetimeMarkMapper } from '../mappers/learn-term-datetime-mark.mapper';
import { ApiResponseHandler } from '../api-response-handler';
import { toIsoString } from '../utils/date.utils';
import {
    existTermMarksAllGet,
    existTermMarksFromTermTermIdGet,
    createMarkCreateModuleIdPost,
    updateLearnMarkEntityUpdateTermMarkIdPut,
    LearnMarkDto
} from '../api/generated/code';

export class LearnTermDatetimeMarkNetworkService implements ILearnTermDatetimeMarkNetworkService {
    private readonly defaultBatchSize = 100;

    constructor(private readonly responseHandler: ApiResponseHandler) {}

    public async getById(_uuid: string): Promise<LearnTermDatetimeMark | null> {
        // Отдельный роут получения единственной метки по UUID не предусмотрен API
        return null;
    }

    /**
     * Получение всех меток обучения для списков модулей
     */
    public async *getByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<LearnTermDatetimeMark[], void, unknown> {
        let offset = options?.offset ?? 0;
        const limit = options?.limit  ?? this.defaultBatchSize;

        while (true) {
            const response = await existTermMarksAllGet({
                query: {
                    module_ids: moduleUuids.length > 0 ? moduleUuids : undefined,
                    limit,
                    offset,
                    updated_after: toIsoString(options?.updatedAfter),
                },
            });

            const dtos = this.responseHandler.handle<LearnMarkDto[]>(response) ?? [];
            if (dtos.length === 0) break;

            yield dtos.map(LearnTermDatetimeMarkMapper.toDomain);

            if (dtos.length < limit) break;
            offset += limit;
        }
    }

    /**
     * Получение меток обучения для списков терминов
     */
    public async *getByTerms(
        termUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<LearnTermDatetimeMark[], void, unknown> {
        if (!termUuids || termUuids.length === 0) return;

        const limit = options?.limit  ?? this.defaultBatchSize;

        for (const termUuid of termUuids) {
            let offset = options?.offset ?? 0;

            while (true) {
                const response = await existTermMarksFromTermTermIdGet({
                    path: { term_id: termUuid },
                    query: {
                        limit,
                        offset,
                        updated_after: toIsoString(options?.updatedAfter),
                    },
                });

                const dtos = this.responseHandler.handle<LearnMarkDto[]>(response) ?? [];
                if (dtos.length === 0) break;

                yield dtos.map(LearnTermDatetimeMarkMapper.toDomain);

                if (dtos.length < limit) break;
                offset += limit;
            }
        }
    }

    public async *getDeleted(_options?: FetchOptions): AsyncGenerator<string[], void, unknown> {
        return;
    }

    /**
     * Создание метки обучения
     */
    public async create(mark: LearnTermDatetimeMark): Promise<LearnTermDatetimeMark> {
        const targetModuleId = (mark as any).moduleId ?? '';

        const response = await createMarkCreateModuleIdPost({
            path: { module_id: targetModuleId },
            body: LearnTermDatetimeMarkMapper.toCreateDto(mark),
        });

        const dto = this.responseHandler.handle<LearnMarkDto>(response);
        return LearnTermDatetimeMarkMapper.toDomain(dto);
    }

    /**
     * Обновление метки обучения
     */
    public async update(
        uuid: string,
        data: Partial<LearnTermDatetimeMarkProps>
    ): Promise<LearnTermDatetimeMark> {
        const response = await updateLearnMarkEntityUpdateTermMarkIdPut({
            path: { term_mark_id: uuid },
            body: LearnTermDatetimeMarkMapper.toUpdateDto(data),
        });

        const dto = this.responseHandler.handle<LearnMarkDto>(response);
        return LearnTermDatetimeMarkMapper.toDomain(dto);
    }

    public async delete(_uuid: string): Promise<void> {
        throw new Error('Delete operation is not supported for LearnTermDatetimeMark');
    }
}