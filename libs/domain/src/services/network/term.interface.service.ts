import {SharedTerm, SharedTermProps, Term, TermProps} from '../../entities/study/term';
// import { SharedTerm, SharedTermProps } from '../../entities/shared-term';
import { FetchOptions } from './fetch-options';

export interface ITermNetworkService {
    // Получение по UUID
    getSharedById(uuid: string): Promise<SharedTerm | null>;
    getPersonalById(uuid: string): Promise<Term | null>;

    // Получение потомков по UUID модулей
    getSharedByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<SharedTerm[], void, unknown>;

    getPersonalByModules(
        moduleUuids: string[],
        options?: FetchOptions
    ): AsyncGenerator<Term[], void, unknown>;

    getDeleted(options?: FetchOptions): AsyncGenerator<string[], void, unknown>;

    // Создание и привязка
    createShared(term: SharedTerm): Promise<SharedTerm>;
    createPersonal(term: Term): Promise<Term>;
    linkToUser(sharedUuid: string): Promise<Term>;

    // Обновление
    updateShared(uuid: string, data: Partial<SharedTermProps>): Promise<SharedTerm>;
    updatePersonal(uuid: string, data: Partial<TermProps>): Promise<Term>;

    // Удаление
    deleteShared(uuid: string): Promise<void>;
    deletePersonal(uuid: string): Promise<void>;
}