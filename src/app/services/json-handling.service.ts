import { Injectable } from "@angular/core";
import exportFromJSON from "export-from-json";
import { Pattern } from "../models/pattern";

@Injectable({
    providedIn: 'root'
})
export class JsonHandling {


    constructor(){}
    
    onExportButtonClick(selected : Pattern) : void{
        let data = selected
        let fileName = selected.patternName
        const exportType = "json"
        exportFromJSON({data,fileName,exportType})
    }
}