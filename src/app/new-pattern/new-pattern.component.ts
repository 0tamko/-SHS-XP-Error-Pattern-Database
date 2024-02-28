import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Pattern } from '../models/pattern';
import { ActivatedRoute } from '@angular/router';
import { PatternsApiService } from '../services/patterns-api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogRemovePatternComponent } from '../dialog-remove-pattern/dialog-remove-pattern.component';
import { Event, EventType, Relation } from '../models/event';
import { DialogEditPatternComponent } from '../dialog-edit-pattern/dialog-edit-pattern.component';
import { Conditions } from '../models/conditions';
import { JsonHandling } from '../services/json-handling.service';

@Component({
  selector: 'app-new-pattern',
  templateUrl: './new-pattern.component.html',
  styleUrls: ['./new-pattern.component.css'],
})
export class NewPatternComponent implements OnInit {
  RecordType = EventType;
  typeMessage = EventType.message;

  pattern: Pattern;
  editingExistedPattern: boolean = false;
  isPristine: boolean = true;
  hasError: boolean = false;
  messageTextAreaValue: string = '';

  currentlySelectedMessages: HTMLElement[] =[];
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

        this.pattern = data.pattern as Pattern;
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

  //------------------------------------------------------------------------------------------

  exportJson(){
    this.jsonHandling.onExportButtonClick(this.pattern)
  }
  importJson(fileInput: HTMLInputElement){
    let ParsedJson: Object;
    fileInput.click()
    fileInput.addEventListener('change', (e) => {
      fileInput.files![0].text()
      .then(importedJson => ParsedJson = JSON.parse(importedJson))
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
  }


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
      data: new Event(this.nextId(),EventType.message,[new Conditions("","")],null,null)
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

  resetPattern(): void {
    this.pattern = {
      id: -1,
      patternName: '',
      logMessage: [],
      dataSource: '',
      imPmNumber: '',
      defect: '',
      errorDescription: '',
      offlineLogReaderPattern: '',
      notes: '',
      resultsInError: '',
      workaround: '',
      components: '',
      foundIn: '',
      solvedIn: '',
      sKB: ''
    };
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

  addTestData(): void {

    let cond1: Conditions[] = [new Conditions("Message","UIS_02005_EXP_RELEASE_SVC"),new Conditions("VK","1"),new Conditions("HK","1")]
    let cond2: Conditions[] = [new Conditions("Message","Water Value recieved"),new Conditions("Dap","0")]

    let cond3: Conditions[] = [new Conditions("Message","UIS_02005_EXP_RELEASE_SVC"),new Conditions("VK","1"),new Conditions("HK","1")]
    let cond4: Conditions[] = [new Conditions("Message","Water Value recieved"),new Conditions("Dap","0")]

    this.pattern = {
      id: -1,
      patternName: 'NetworkDeviceConfigurationException',
      logMessage: [
        new Event(1,EventType.message,cond1,null,null),
        new Event(2,EventType.message,cond2,null,null),
        new Event(3,EventType.relationShip,null,new Relation("WITHIN",30),[new Event(4,EventType.message,cond3,null,null),new Event(5,EventType.message,cond4,null,null,true)])
      ],
      dataSource: "syngo.txt",
      imPmNumber: 'PM00255093',
      defect: 'Defect 219032_ Rejected images are automatically selected in distribution workflow step',
      errorDescription: 'Rejceted images are automatically marked for sending',
      offlineLogReaderPattern: 'n/a',
      notes: "Query/Retrieve of PACS is not configured correctly in UIS",
      resultsInError: 'yes',
      workaround: 'yes',
      components: 'Syngo',
      foundIn: 'VA10C',
      solvedIn: 'VA10CD',
      sKB: 'SKB0118078'
    };

  }

  checkDirty(): void {
    this.isPristine = false;
  }

}
