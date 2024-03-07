import { Conditions } from "./conditions";

export class PatternDefinitionJson{
    id: string;
    patternName: string;
    metadata: MetadataItem = new MetadataItem();
    definition: DefinitionItem[] = [];
    algorithm: AlgorithmItem[] = [];

}

export class AlgorithmItem {
    type: string;
    value: string;
    members: AlgorithmItem[];
}

export class DefinitionItem {
    id: string;
    conditions: Conditions[];
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