import { Sentence } from '../../entities/sentence';

export interface ISentenceRepository {
    getById(uuid: string, userUuid: string): Promise<Sentence | null>;
    getByTerm(termUuid: string, userUuid: string): Promise<Sentence[]>;
    save(sentence: Sentence): Promise<void>;
    saveBatch(sentences: Sentence[]): Promise<void>;
    delete(uuid: string, userUuid: string): Promise<void>;
}