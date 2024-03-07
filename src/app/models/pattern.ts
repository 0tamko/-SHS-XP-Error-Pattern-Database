import { AlgorithmItem, DefinitionItem } from "./PatternDefinitionJson";
import { Event } from "./event";

export interface Pattern {
  id: number;
  patternName: string;
  logMessage: AlgorithmDefinitionItem;
  dataSource: string;
  imPmNumber: string;
  defect: string;
  errorDescription: string;
  offlineLogReaderPattern: string;
  notes: string;
  resultsInError: string;
  workaround: string;
  components: string;
  foundIn: string;
  solvedIn: string;
  sKB: string;
}

export class AlgorithmDefinitionItem{
  algorithm: AlgorithmItem[];
  definition: DefinitionItem[];
}