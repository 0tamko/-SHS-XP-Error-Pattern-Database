import { Event } from "./event";

export interface Pattern {
  id: number;
  patternName: string;
  logMessage: Event[];
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
