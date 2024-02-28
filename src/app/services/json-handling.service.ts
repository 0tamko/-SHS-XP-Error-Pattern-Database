import { Injectable } from "@angular/core";
import { Pattern } from "../models/pattern";
import { Event } from "../models/event";
import { Conditions } from "../models/conditions";
import exportFromJSON from "export-from-json";


@Injectable({
    providedIn: 'root'
})
export class JsonHandling {

    constructor() { }

    importPatternFromJson(patternDefinitonJson: string): Pattern {
        let pattern = new Object() as Pattern;
        pattern.logMessage = [];
        let parsedJson = JSON.parse(patternDefinitonJson);
        let patternDefinition = parsedJson as PatternDefinitionJson;
        
        // fill events
        patternDefinition.algorithm.forEach(element => {
            pattern.logMessage.push(this.searchEvent(element, patternDefinition.definition));
        });

        //fill metadata
        pattern.id = Number.parseInt(patternDefinition.id);
        pattern.patternName = patternDefinition.patternName;
        pattern.dataSource = patternDefinition.metadata.dataSource ?? "";
        pattern.imPmNumber = patternDefinition.metadata.imPmNumber ?? "";
        pattern.defect = patternDefinition.metadata.defect ?? "";
        pattern.errorDescription = patternDefinition.metadata.errorDescription ?? "";
        pattern.offlineLogReaderPattern = patternDefinition.metadata.offlineLogReaderPattern ?? "";
        pattern.notes = patternDefinition.metadata.notes ?? "";
        pattern.resultsInError = patternDefinition.metadata.resultsInError ?? "";
        pattern.workaround = patternDefinition.metadata.workaround ?? "";
        pattern.components = patternDefinition.metadata.components ?? "";
        pattern.foundIn = patternDefinition.metadata.foundIn ?? "";
        pattern.solvedIn = patternDefinition.metadata.solvedIn ?? "";
        pattern.sKB = patternDefinition.metadata.sKB ?? "";

        return pattern;
    }

    exportPatternToJsonDownload(selected: Pattern): void {

        let patternDefinitionJson = new PatternDefinitionJson();
        patternDefinitionJson.id = selected.id.toString();
        patternDefinitionJson.patternName = selected.patternName;
    
        // fill metadata
        patternDefinitionJson.metadata.dataSource = selected.dataSource;
        patternDefinitionJson.metadata.imPmNumber = selected.imPmNumber;
        patternDefinitionJson.metadata.defect = selected.defect;
        patternDefinitionJson.metadata.errorDescription = selected.errorDescription;
        patternDefinitionJson.metadata.offlineLogReaderPattern = selected.offlineLogReaderPattern;
        patternDefinitionJson.metadata.notes = selected.notes;
        patternDefinitionJson.metadata.resultsInError = selected.resultsInError;
        patternDefinitionJson.metadata.workaround = selected.workaround;
        patternDefinitionJson.metadata.components = selected.components;
        patternDefinitionJson.metadata.foundIn = selected.foundIn;
        patternDefinitionJson.metadata.solvedIn = selected.solvedIn;
        patternDefinitionJson.metadata.sKB = selected.sKB;


        // fill 'definition' part
        selected.logMessage.forEach(element => {
            this.searchDefinitionItems(element, patternDefinitionJson.definition);
        });

        // fill 'algorithm' part
        selected.logMessage.forEach(element => {
            patternDefinitionJson.algorithm.push(this.searchAlgorithmItems(element, new AlgorithmItem()));
        });

        console.log(JSON.stringify(patternDefinitionJson));

        let data = patternDefinitionJson;
        let fileName = selected.patternName;
        const exportType = "json";
        exportFromJSON({ data, fileName, exportType });
    }

    searchEvent(algorithm: AlgorithmItem, definitions: DefinitionItem[]): Event {
        if (algorithm.type.includes("event") || algorithm.type.includes("Event")) {
            let newEvent = new Event(
                Number.parseInt(algorithm.value),
                0,
                definitions.find(x => x.id == algorithm.value)?.conditions ?? null,
                null,
                null,
                algorithm.type.includes("terminate") ? true : false,
            );
            return newEvent;
        }
        else {
            let innerEvents: Event[] = [];

            algorithm.members.forEach(element => {
                innerEvents.push(
                    this.searchEvent(element, definitions)
                )
            });

            let newEvent = new Event(
                Number.parseInt(algorithm.value),
                1,
                null,
                { "name": algorithm.type, "value": Number.parseInt(algorithm.value) },
                innerEvents,
                false
            );
            return newEvent;
        }

    }

    searchDefinitionItems(event: Event, definitionItems: DefinitionItem[]): DefinitionItem[] {
        if (event.type === 0) {
            let newDefinitionItem = new DefinitionItem();
            newDefinitionItem.id = event.id.toString();
            newDefinitionItem.conditions = event.conditions || [];
            definitionItems.push(newDefinitionItem)
        }
        else {
            event.members?.forEach(element => {
                this.searchDefinitionItems(element, definitionItems);
            });
        }

        return definitionItems;
    }

    searchAlgorithmItems(event: Event, algorithmItem: AlgorithmItem): AlgorithmItem {
        if (event.type === 0) {
            if (event.notState) {
                algorithmItem.type = "terminateEvent";
            }
            else {
                algorithmItem.type = "event";
            }
            algorithmItem.value = event.id.toString();
        }
        else {
            algorithmItem.type = event.operator?.name || "";
            algorithmItem.value = event.operator?.value?.toString() || "";
            algorithmItem.members = [];

            event.members?.forEach(element => {

                let newAlgorithmItem = new AlgorithmItem();
                newAlgorithmItem = this.searchAlgorithmItems(element, newAlgorithmItem);

                algorithmItem.members.push(
                    newAlgorithmItem
                );
            });
        }

        return algorithmItem;
    }
}

class PatternDefinitionJson {
    id: string;
    patternName: string;
    metadata: MetadataItem = new MetadataItem();
    definition: DefinitionItem[] = [];
    algorithm: AlgorithmItem[] = [];
}

class AlgorithmItem {
    type: string;
    value: string;
    members: AlgorithmItem[];
}

class DefinitionItem {
    id: string;
    conditions: Conditions[];
}

class MetadataItem {
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