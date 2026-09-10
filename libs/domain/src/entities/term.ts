import { LearnWriteEntity } from './enums';
// import { Module } from './module';

export interface TermProps {
    uuid: string;
    userUuid: string;
    term: string;
    definition: string;
    moduleUuid: string;
    chooseErrorCounter: number;
    writeErrorCounter: number;
    choiceNegErrorCounter: number;
    watchCount: number;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;
}

export class Term implements LearnWriteEntity, TermProps {
    uuid: string;
    userUuid: string;
    term: string;
    definition: string;
    moduleUuid: string;

    private _chooseErrorCounter: number;
    private _writeErrorCounter: number;
    private _choiceNegErrorCounter: number;
    private _watchCount: number;

    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;

    // Внутреннее состояние рандома для режима обучения
    // private internalReverseWrite: boolean | null = null;
    // private internalReverseChoice: boolean | null = null;

    constructor(props: TermProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.term = props.term;
        this.definition = props.definition;
        this.moduleUuid = props.moduleUuid;
        this._chooseErrorCounter = Math.max(0, props.chooseErrorCounter);
        this._writeErrorCounter = Math.max(0, props.writeErrorCounter);
        this._choiceNegErrorCounter = Math.max(0, props.choiceNegErrorCounter);
        this._watchCount = Math.max(0, props.watchCount);
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.personalCreatedAt = props.personalCreatedAt;
        this.personalUpdatedAt = props.personalUpdatedAt;
    }

    // Геттеры и сеттеры с гарантией неотрицательных значений
    get chooseErrorCounter(): number { return this._chooseErrorCounter; }
    set chooseErrorCounter(val: number) { this._chooseErrorCounter = Math.max(0, val); }
    //
    get writeErrorCounter(): number { return this._writeErrorCounter; }
    set writeErrorCounter(val: number) { this._writeErrorCounter = Math.max(0, val); }
    //
    get choiceNegErrorCounter(): number { return this._choiceNegErrorCounter; }
    set choiceNegErrorCounter(val: number) { this._choiceNegErrorCounter = Math.max(0, val); }
    //
    get watchCount(): number { return this._watchCount; }
    set watchCount(val: number) { this._watchCount = Math.max(0, val); }
    //
    // // Доменная логика реверса
    // public updateReverseWrite(): void {
    //     this.internalReverseChoice = null;
    //     this.internalReverseWrite = Math.random() < 0.5;
    // }
    //
    // public updateReverseChoice(): void {
    //     this.internalReverseChoice = Math.random() < 0.5;
    //     this.internalReverseWrite = null;
    // }
    //
    // public resetReverse(): void {
    //     this.internalReverseChoice = null;
    //     this.internalReverseWrite = null;
    // }
    //
    // public isTermReverseWrite(module: Module): boolean {
    //     if (this.internalReverseWrite === null) {
    //         this.internalReverseWrite = Math.random() < 0.5;
    //     }
    //     return module.standardAndReverseWrite
    //         ? this.internalReverseWrite
    //         : module.isReverseDefinitionWrite;
    // }
    //
    // public isTermReverseChoice(module: Module): boolean {
    //     if (this.internalReverseChoice === null) {
    //         this.internalReverseChoice = Math.random() < 0.5;
    //     }
    //     return module.standardAndReverseChoice
    //         ? this.internalReverseChoice
    //         : module.isReverseDefinitionChoice;
    // }
    //
    // public getMaybeReverseTermWrite(module: Module): string {
    //     return this.isTermReverseWrite(module) ? this.definition : this.term;
    // }
    //
    // public getMaybeReverseDefinitionWrite(module: Module): string {
    //     return this.isTermReverseWrite(module) ? this.term : this.definition;
    // }
    //
    // // Реализация интерфейса LearnWriteEntity
    // get termUuid(): string {
    //     return this.uuid;
    // }

    // get targetWrite(): string {
    //     return this.definition;
    // }
}