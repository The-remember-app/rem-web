import { LearnTermDatetimeMark, LearnTermDatetimeMarkProps } from '../../entities/study/learn-term-datetime-mark';
import { FetchOptions } from './fetch-options';

export interface ILearnTermDatetimeMarkNetworkService {
    // Получение по UUID
    getById(uuid: string): Promise<LearnTermDatetimeMark | null>;

    // Получение потомков по UUID модулей или терминов
    getByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<LearnTermDatetimeMark[], void, unknown>;

    getByTerms(
        termUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<LearnTermDatetimeMark[], void, unknown>;
    getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown>;

    // CRUD
    create(mark: LearnTermDatetimeMark): Promise<LearnTermDatetimeMark>;
    update(uuid: string, data: Partial<LearnTermDatetimeMarkProps>): Promise<LearnTermDatetimeMark>;
    delete(uuid: string): Promise<void>;
}