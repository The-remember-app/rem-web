import { Term } from '../../entities/term';

export interface ITermRepository {
    getById(uuid: string, userUuid: string): Promise<Term | null>;
    getByModule(moduleUuid: string, userUuid: string): Promise<Term[]>;
    save(term: Term): Promise<void>;
    saveBatch(terms: Term[]): Promise<void>;
    updateCounters(
        uuid: string,
        userUuid: string,
        counters: Partial<Pick<Term, 'chooseErrorCounter' | 'writeErrorCounter' | 'choiceNegErrorCounter' | 'watchCount'>>
    ): Promise<void>;
    delete(uuid: string, userUuid: string): Promise<void>;
}