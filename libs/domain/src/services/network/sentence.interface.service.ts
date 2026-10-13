import { Sentence, SentenceProps } from '../../entities/study/sentence';
import { FetchOptions } from './fetch-options';

export interface ISentenceNetworkService {
    // Получение по UUID
    getById(uuid: string): Promise<Sentence | null>;

    // Получение потомков по UUID модулей или терминов
    getByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Sentence[], void, unknown>;

    getByTerms(
        termUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Sentence[], void, unknown>;

    getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown>;

    // CRUD
    create(sentence: Sentence): Promise<Sentence>;
    update(uuid: string, data: Partial<SentenceProps>): Promise<Sentence>;
    delete(uuid: string): Promise<void>;
}