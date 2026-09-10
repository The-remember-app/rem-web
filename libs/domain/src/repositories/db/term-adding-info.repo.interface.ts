import { TermAddingInfo } from '../../entities/term-adding-info';

export interface ITermAddingInfoRepository {
    getById(uuid: string, userUuid: string): Promise<TermAddingInfo | null>;
    getByTerm(termUuid: string, userUuid: string): Promise<TermAddingInfo[]>;
    save(info: TermAddingInfo): Promise<void>;
    saveBatch(infos: TermAddingInfo[]): Promise<void>;
    delete(uuid: string, userUuid: string): Promise<void>;
}