import { TermAddingInfo, TermAddingInfoProps } from '../../entities/study/term-adding-info';
import { FetchOptions } from './fetch-options';

export interface ITermAddingInfoNetworkService {
    // Получение по UUID
    getById(uuid: string): Promise<TermAddingInfo | null>;

    // Получение потомков по UUID модулей, терминов или родительской доп. инфы
    getByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<TermAddingInfo[], void, unknown>;

    getByTerms(
        termUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<TermAddingInfo[], void, unknown>;

    getByParents(
        parentInfoUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<TermAddingInfo[], void, unknown>;

    getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown>;

    // CRUD
    create(info: TermAddingInfo): Promise<TermAddingInfo>;
    update(uuid: string, data: Partial<TermAddingInfoProps>): Promise<TermAddingInfo>;
    delete(uuid: string): Promise<void>;
}