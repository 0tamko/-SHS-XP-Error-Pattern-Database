import { Conditions } from "./conditions";

export class PatternDefinitionJson {
    id: number;
    patternName: string;
    metadata: MetadataItem = new MetadataItem();
    definition: DefinitionItem[] = [];
    algorithm: AlgorithmItem[] = [];

}

export class AlgorithmItem {

    constructor(id: number) {
        this.id = id;
    }

    id: number;
    type: string;
    value: string;
    members: AlgorithmItem[] =[];
}

export class DefinitionItem {

    constructor(id: number) {
        this.id = id;
    }

    id: number;
    name: string;
    conditions: Conditions[] = [];
}

export class MetadataItem {
    dataSource: string | null;
    imPmNumber: string | null;
    defect: string | null;
    errorDescription: string | null;
    offlineLogReaderPattern: string | null;
    notes: string | null;
    resultsInError: string | null;
    workaround: string | null;
    components: string | null;
    foundIn: string | null;
    solvedIn: string | null;
    sKB: string | null;
}