import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlgorithmDefinitionItem, Pattern } from '../models/pattern';
import { ActivatedRoute } from '@angular/router';
import { PatternsApiService } from '../services/patterns-api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogRemovePatternComponent } from '../dialog-remove-pattern/dialog-remove-pattern.component';
import { Event } from '../models/event';
import { DialogEditPatternComponent } from '../dialog-edit-pattern/dialog-edit-pattern.component';
import { Conditions } from '../models/conditions';
import { JsonHandling } from '../services/json-handling.service';
import { AlgorithmItem, DefinitionItem, PatternDefinitionJson } from '../models/PatternDefinitionJson';

@Component({
  selector: 'app-new-pattern',
  templateUrl: './new-pattern.component.html',
  styleUrls: ['./new-pattern.component.css'],
})
export class NewPatternComponent implements OnInit {

  newPattern: PatternDefinitionJson;

  editingExistedPattern: boolean = false;
  isPristine: boolean = true;
  hasError: boolean = false;
  messageTextAreaValue: string = '';

  currentlySelectedElement: HTMLElement[] =[];
  isMultiSelectActive: boolean =false;
id: any;


  @HostListener('window:keydown.control', ['$event']) 
  ShiftKeyDown() {
    this.isMultiSelectActive = true; 
  }
  @HostListener('window:keyup.control', ['$event']) 
  ShiftKeyUp(){
    this.isMultiSelectActive = false; 
  }


  constructor(private router: Router, private patternApi: PatternsApiService, private activatedRoute: ActivatedRoute
    ,private dialog: MatDialog, private cdref: ChangeDetectorRef,private jsonHandling : JsonHandling) { }

  ngOnInit(): void {  
    if (this.activatedRoute.snapshot.paramMap.keys.length !== 0) {
      this.editingExistedPattern = true;
      this.activatedRoute.data.subscribe((data: any) => {

        this.newPattern = data.pattern as PatternDefinitionJson;
      });
    }
    else {
      this.resetPattern();
      this.editingExistedPattern = false;
    }
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
    this.cdref.detach();
  }
/*
  exportJson(){
    this.jsonHandling.exportPatternToJsonDownload(this.pattern)
  }
  importJson(fileInput: HTMLInputElement){
    let ParsedJson: Object;
    fileInput.click()
    fileInput.addEventListener('change', (e) => {
      fileInput.files![0].text()
      .then(importedJson => ParsedJson = this.jsonHandling.importPatternFromJson(importedJson))
      .finally(() => {
        try{
          this.pattern = ParsedJson as Pattern
        }
        catch{
          console.log("nedobre")
        }
      })
      .catch(e => console.log(e))
    })
  }*/
  /*
  nextId():number{
    if(this.pattern.logMessage.length ==0)
      return 0;
    return Math.max(...this.pattern.logMessage.map(x => x.id))+1
  }

  divClicked($event: any): void {
    let element = event?.currentTarget as HTMLElement
    if(this.isMultiSelectActive)    
      this.handleMultiElementClick(element)
    else{
      this.handleSingleElementClick(element)
    }
  }

  handleSingleElementClick(element: HTMLElement):void{
    if(element.classList.contains("clickable-row")){

      if(this.currentlySelectedMessages[0] == element && this.currentlySelectedMessages.length == 1){
        this.currentlySelectedMessages[0].className = "clickable-row"
        this.currentlySelectedMessages.pop()
      }
      else{
        if(this.currentlySelectedMessages.length > 0){
          this.currentlySelectedMessages.every(x => x.className = "clickable-row")
          this.currentlySelectedMessages = []
        }
        this.currentlySelectedMessages.push(element);
        this.currentlySelectedMessages[0].className = "selected clickable-row"
      }
    }
  }

  handleMultiElementClick(element:HTMLElement): boolean| void{
    if(this.currentlySelectedMessages.includes(element)){
      return;
    }

    this.currentlySelectedMessages.push(element);
    this.currentlySelectedMessages[this.currentlySelectedMessages.length -1].className = "selected clickable-row"
  }

  isChangePositionPossible(indexChange: number): boolean { 
    if (this.currentlySelectedMessages.length == 0 )
      return true;
    
    const isNotPossibleToChangePosition = this.currentlySelectedMessages.some(currentlySelectedItem =>{
      if(this.pattern.logMessage.length <= (currentlySelectedItem.tabIndex +indexChange)|| 
      (currentlySelectedItem.tabIndex + indexChange) < 0)
        return true
      else
        return false
    })

    return isNotPossibleToChangePosition
  }

  //Don't fix it if it ain't broke, then rewrite to more human code
  changePosition(targetIndex: number): void {

    if(targetIndex ===1 && this.currentlySelectedMessages.length > 1)
      this.currentlySelectedMessages.sort((a,b)=> {
        if(a.tabIndex > b.tabIndex)
          return -1;
        if(a.tabIndex < b.tabIndex)
          return 1;

        return 0;
        }
      )
    if(targetIndex ===-1 && this.currentlySelectedMessages.length > 1)
      this.currentlySelectedMessages.sort((a,b)=> {
        if(a.tabIndex < b.tabIndex)
          return -1;
        if(a.tabIndex > b.tabIndex)
          return 1;

        return 0;
        }
      )

    this.currentlySelectedMessages.forEach(currentlySelectedMessage => {
    
      let currentIndex = currentlySelectedMessage.tabIndex;
      let temp = this.pattern.logMessage[currentIndex + targetIndex]


      this.pattern.logMessage[currentIndex + targetIndex] = this.pattern.logMessage[currentIndex]
      this.pattern.logMessage[currentIndex] = temp;
    })
    this.isPristine = false;
  }

  addMessage():void  {
    const dialogRef = this.dialog.open(DialogEditPatternComponent,{
      data: new Event(this.nextId(),EventType.message,[new Conditions("","")],null,[])
    });

    dialogRef.afterClosed().subscribe(newRecord => {
      if(newRecord instanceof Event){
        this.pattern.logMessage.push(newRecord)
        this.isPristine = false;
      }
    })
  }

  removeMessage():void  {
    this.currentlySelectedMessages.forEach(currentlySelectedMessageId => 
      { 
      let foundedIndex = this.pattern.logMessage.findIndex(
        recordId => recordId.id == Number(currentlySelectedMessageId.id)
        )
        
      this.pattern.logMessage.splice(Number(foundedIndex),1)
      }
    )
    this.currentlySelectedMessages = []

    this.isPristine = false; 
  }
  
  addLogicalOperator(type: string): void {

    let newRecord:Event = new Event(this.nextId(),EventType.relationShip,null,new Relation(type),[])
    let statrIndex: number = Math.min(...this.currentlySelectedMessages.map(elementIndex=> elementIndex.tabIndex))
  
    let objectsToTransports: Event[] = this.currentlySelectedMessages.map(elementIndex => this.pattern.logMessage[elementIndex.tabIndex])
    newRecord.members?.push(...objectsToTransports)
    this.pattern.logMessage.splice(statrIndex,this.currentlySelectedMessages.length,newRecord)
  
    this.currentlySelectedMessages =[]

    this.isPristine = false;
  }

  negateEvent():void{
    const index = this.currentlySelectedMessages[0].tabIndex;
    this.pattern.logMessage[index].notState= !this.pattern.logMessage[index].notState 
  }

  splitRelationShip(id: number):void {
    let objectsToSplit = this.pattern.logMessage.filter(item => item.id === id).map(x => x.members)
    this.pattern.logMessage.splice(this.pattern.logMessage.findIndex(x=> x.id ==id),1,...objectsToSplit.flat().map(x=>x as Event))
    this.isPristine = false;
  }

  editDialogPattern(event: Event): void{
      const dialogRef = this.dialog.open(DialogEditPatternComponent,
        {
          data: event
        });
  
      dialogRef.afterClosed().subscribe(editedRecord => {
        if(editedRecord instanceof Event){
          event = Object.assign(event,editedRecord);

          this.isPristine = false;
        }
      })
  }
  
  }

  onClose(): void {
    if (this.isPristine) {
      this.router.navigateByUrl('/table');
    }
    else {
      this.openDialog()
    }
  }

  onSave(): void {
    if (this.pattern.patternName === '') {
      this.hasError = true;
      return;
    }

    if (this.editingExistedPattern) {
      this.patternApi.updatePattern(this.pattern.id, this.pattern).subscribe(
      () => 
      {
        this.router.navigateByUrl('/table');

      },
      error =>
      {
        console.log(error);
      });
    }
    else {
      this.patternApi.addPattern(this.pattern).subscribe(
        () => 
        {
        this.router.navigateByUrl('/table');

      },
      error =>
      {
        console.log(error);
      });
    }
  }



  openDialog(): void {
    const dialogRef = this.dialog.open(DialogRemovePatternComponent, { data: { text: 'Would you like to save your changes?', yes: 'yes', no: 'no' } });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        if (this.pattern.patternName === '') {
          this.hasError = true;
          return;
        }
        if (this.editingExistedPattern) {
          this.patternApi.updatePattern(this.pattern.id, this.pattern).subscribe(() => {
            this.router.navigateByUrl('/table');
          });
        }
        else {
          this.patternApi.addPattern(this.pattern).subscribe(() => {
            this.router.navigateByUrl('/table');
          });
        }
      }
      else {
        this.router.navigateByUrl('/table');
      }
    });
  }

  patternMap(input : string ): string{
    if(input.includes("*"))
    {
      if(input.startsWith("*") && input.endsWith("*"))
        return "Contains"
      if(input.startsWith("*"))
        return "Starts with"
      if(input.endsWith("*"))
        return "End with"
    }
    return "Equals"
  }
*/

elementClicked($event : EventTarget | null)
{
  const htmlElement : HTMLElement = $event as HTMLElement

  //Deselect if the first one was clicked again
  if(htmlElement.className.includes(" list-item-selected"))
  {
    const indexOfElement: number = this.currentlySelectedElement.findIndex(element => element === htmlElement)
    const className : string = this.currentlySelectedElement[indexOfElement].className;
    this.currentlySelectedElement[indexOfElement].className = className.replace("list-item-selected","")

    this.currentlySelectedElement.splice(indexOfElement,1)
    return;
  }
    
  //If any conditions above doesn't match, it  add  element to list
  htmlElement.className += " list-item-selected"
  this.currentlySelectedElement.push(htmlElement)

}

cut()
{
  
}

patternMap(input : string ): string{
  if(input.includes("*"))
  {
    if(input.startsWith("*") && input.endsWith("*"))
      return "Contains"
    if(input.startsWith("*"))
      return "Starts with"
    if(input.endsWith("*"))
      return "End with"
  }
  return "Equals"
}

pairDefinitionWithAlgorithm(algorithm: AlgorithmItem,definition : DefinitionItem[]
){
  if (algorithm.type.includes("event") || algorithm.type.includes("Event")) {
    let eventToReturn = new Event(
      Number.parseInt(algorithm.value),
      definition.find(x => x.id == algorithm.value)?.conditions ?? null,
      algorithm.type.includes("terminate") ? true : false,
    )
  return eventToReturn
  }
  return;
}


  addTestData(): void {

    let definitionItem : DefinitionItem[] =  [
      {
      id : "waterValue",
      conditions :
      [
          { "source" : "EMH.Message", "pattern" : "Water Value Received"}
      ]
  },
  {
      id : "expRelease",
      conditions :
      [
          { source : "EMH.ID", "pattern" : "UIS_02005_EXP_RELEASE_SVC*"},
          { source : "EMH.Message", "pattern" : "*VK = 1, HK = 1*"},
          { source : "VK", pattern : "*1"} 
      ]
  },        
  {
      id : "imageStoreFailed",
      conditions :
      [
          { "source" : "EMH.", "pattern" : "*image not stored"}                
      ]
  }
]

    let algorithmItem : AlgorithmItem[] = [
      {
      type : "within",
      value : "10000",
      members : 
      [
          {
              type : "or",
              value : "",
              members : 
              [
                  {
                      type : "event",
                      value : "waterValue",
                      members : []
                  },
                  {
                      type : "event",
                      value : "expRelease",
                      members : []
                  },
              ]
          },               
          {
              type : "terminateEvent",
              value : "imageStoreFailed",
              members : []
          } 
      ]
  }]

    this.newPattern = {
      id: -1,
      patternName: "NetworkDeviceConfigurationException",
      metadata: {
        dataSource: "syngo.txt",
        imPmNumber: "PM00255093",
        defect: "Defect 219032_ Rejected images are automatically selected in distribution workflow step",
        errorDescription: "Rejceted images are automatically marked for sending",
        offlineLogReaderPattern: "n/a",
        notes: "Query/Retrieve of PACS is not configured correctly in UIS",
        resultsInError: "yes",
        workaround: 'yes',
        components: 'Syngo',
        foundIn: 'VA10C',
        solvedIn: 'VA10CD',
        sKB: 'SKB0118078'
      },
      definition: definitionItem,
      algorithm: algorithmItem,
    }
    console.table(this.newPattern)
  }

  checkDirty(): void {
    this.isPristine = false;
  }

  resetPattern(): void {
    this.newPattern = new PatternDefinitionJson
  }
}
