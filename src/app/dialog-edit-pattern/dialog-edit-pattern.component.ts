import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Event } from '../models/event';
import { Conditions} from '../models/conditions';
import { MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import { patternToolTipOptions } from '../app.component';


@Component({
  selector: 'app-dialog-edit-pattern',
  templateUrl: './dialog-edit-pattern.component.html',
  styleUrls: ['./dialog-edit-pattern.component.css'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: patternToolTipOptions}]
})


export class DialogEditPatternComponent implements OnInit {
  
  
  //recordForEdit : Record = new Record(this.data.record.id,
  //  this.data.record.type,this.data.record.conditions,this.data.record.operator,this.data.record.members)

  eventForEdit: Event ;

  selectableOptions: posibleOptions[] = [];
  options= [ "Equals","Contains","Start with","End with"];
  

  constructor(public dialogRef:MatDialogRef<DialogEditPatternComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event) { }

  ngOnInit(): void {
      this.eventForEdit= new Event(this.data.id,this.data.type,Conditions.clone(this.data.conditions),this.data.operator,this.data.members,this.data.notState)
      this.generatePosibleOptions()
  }
  removeOperationOnSelectChange(condition : string){
    console.log("change")
    condition.split("*").join("")
  }

  generatePosibleOptions(){
    this.selectableOptions =[];
    this.eventForEdit.conditions?.forEach((condition: Conditions) =>
    {
      if(condition.pattern.includes("*"))
      {
        if(condition.pattern.startsWith("*") && condition.pattern.endsWith("*"))
        {
          this.selectableOptions.push({selectedOption: "Contains"})
          return;
        }
        if(condition.pattern.startsWith("*"))
          this.selectableOptions.push({selectedOption: "Start with"})
        if(condition.pattern.endsWith("*"))
          this.selectableOptions.push({selectedOption: "End with"})
      }
      else
        this.selectableOptions.push({selectedOption: "Equals"})
    })
  }


  addOperation(condition: Conditions, option : String) : void{
    condition.pattern = condition.pattern.split("*").join("")

    switch(option){
      case "Equals":{
        condition.pattern = condition.pattern;
        break;
      }
      case "Contains":{
        condition.pattern = "*" + condition.pattern + "*"
        break; 
      }
      case "Start with": {
        condition.pattern = "*" + condition.pattern
        break; 
      }
      case "End with": {
        condition.pattern = condition.pattern+"*"
        break;
      }
    }
  }

  addContions(): void{
    this.eventForEdit.conditions!.push(new Conditions("",""))
    this.selectableOptions.push({selectedOption: "Equals"})
  }

  removeCondtion(condtion: Conditions): void{
    const index: number = this.eventForEdit.conditions!.indexOf(condtion) 
    this.eventForEdit.conditions!.splice(index,1)
  }
}

export interface posibleOptions{
  selectedOption: String
}