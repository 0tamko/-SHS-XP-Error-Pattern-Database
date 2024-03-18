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
import { HtmlParser } from '@angular/compiler';
import exportFromJSON from 'export-from-json';
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

  currentlySelectedElement: HTMLElement[] = [];
  isMultiSelectActive: boolean = false;

  cuttedAlgorithmItems: HTMLElement[] = [];

  id: any;


  @HostListener('window:keydown.control', ['$event'])
  ShiftKeyDown() {
    this.isMultiSelectActive = true;
  }
  @HostListener('window:keyup.control', ['$event'])
  ShiftKeyUp() {
    this.isMultiSelectActive = false;
  }

  constructor(private router: Router, private patternApi: PatternsApiService, private activatedRoute: ActivatedRoute
    , private dialog: MatDialog, private cdref: ChangeDetectorRef, private jsonHandling: JsonHandling) { }

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

  exportJson() {
    let data = this.newPattern;
    let fileName = this.newPattern.patternName;
    const exportType = "json";
    exportFromJSON({ data, fileName, exportType });
  }
  importJson(fileInput: HTMLInputElement) {
    let ParsedJson: Object;
    fileInput.click()
    fileInput.addEventListener('change', (e) => {
      fileInput.files![0].text()
        .then(importedJson => ParsedJson = importedJson)
        .finally(() => {
          try {
            this.newPattern = JSON.parse(ParsedJson.toString());
            console.log(this.newPattern);
          }
          catch {
            console.log("nedobre")
          }
        })
        .catch(e => console.log(e))
    })
  }

  close() {
    if (this.isPristine) {
      this.router.navigateByUrl('/table');
    }
    else {
      this.openDialog()
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogRemovePatternComponent, { data: { text: 'Would you like to save your changes?', yes: 'yes', no: 'no' } });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        if (this.newPattern.patternName === '') {
          this.hasError = true;
          return;
        }
        if (this.editingExistedPattern) {
          this.patternApi.updatePattern(this.newPattern.id, this.newPattern).subscribe(() => {
            this.router.navigateByUrl('/table');
          });
        }
        else {
          this.patternApi.addPattern(this.newPattern).subscribe(() => {
            this.router.navigateByUrl('/table');
          });
        }
      }
      else {
        this.router.navigateByUrl('/table');
      }
    });
  }

  save() {
    if (this.newPattern.patternName === '') {
      this.hasError = true;
      return;
    }

    if (this.editingExistedPattern) {
      this.patternApi.updatePattern(this.newPattern.id, this.newPattern).subscribe(() => {
        this.router.navigateByUrl('/table');
      });
    }
    else {
      this.patternApi.addPattern(this.newPattern).subscribe(() => {
        this.router.navigateByUrl('/table');
      });
    }
  }

  editDialogPattern(): void {

    let definitionItem;

    this.newPattern.algorithm.forEach(element => {
      let output = this.getDefinitionIdFromAlgorithmItemId(element, Number(this.currentlySelectedElement[0].id))
      if (output) {
        definitionItem = output;
      }
    });

    const dialogRef = this.dialog.open(DialogEditPatternComponent,
      {
        data: definitionItem
      });

    dialogRef.afterClosed().subscribe(editedRecord => {

    })
  }
  addMessage(): void {

    let uniqueId = this.getUniqueId();

    const dialogRef = this.dialog.open(DialogEditPatternComponent, {
      data: new DefinitionItem(uniqueId!)
    });

    dialogRef.afterClosed().subscribe(newRecord => {
      let newDefinitionItem = newRecord as DefinitionItem;
      let newAlgorithmItem = new AlgorithmItem(this.getUniqueId());

      newAlgorithmItem.type = "event";
      newAlgorithmItem.value = newDefinitionItem.id.toString();

      this.newPattern.definition.push(newDefinitionItem);
      this.newPattern.algorithm.push(newAlgorithmItem);
    })
  }

  getUniqueId() {
    let uniqueId = 0;

    this.newPattern.algorithm.forEach(element => {
      uniqueId = this.getUniqueIdRecursive(element, uniqueId);
    });

    return uniqueId;
  }

  getUniqueIdRecursive(algorithmItem: AlgorithmItem, currentId: number): number {

    if (algorithmItem.id >= currentId) {
      currentId = algorithmItem.id + 1;
    }

    if (algorithmItem.type.toLocaleLowerCase().includes("event") && Number(algorithmItem.value) >= currentId) {
      currentId = Number(algorithmItem.value) + 1;
    }

    algorithmItem.members.forEach(element => {
      currentId = this.getUniqueIdRecursive(element, currentId);
    });

    return currentId + 1;
  }

  elementClicked($event: EventTarget | null) {
    const htmlElement: HTMLElement = $event as HTMLElement

    if (this.cuttedAlgorithmItems.length === 1 && this.currentlySelectedElement.length === 1 && !htmlElement.className.includes("selected") ||
      htmlElement.className.includes("cutted")) {
      return;
    }
    if (this.cuttedAlgorithmItems.length === 1 &&
      (htmlElement.innerText.toLowerCase().startsWith("event") || htmlElement.innerText.toLowerCase().startsWith("terminate"))) {
      return;
    }
    if (this.cuttedAlgorithmItems.length === 1 && (this.isParentElement(Number(this.cuttedAlgorithmItems[0].id), Number(htmlElement.id)))) {
      return;
    }

    //Deselect if the first one was clicked again
    if (htmlElement.className.includes(" list-item-selected")) {
      const indexOfElement: number = this.currentlySelectedElement.findIndex(element => element.id === htmlElement.id)
      const className: string = this.currentlySelectedElement[indexOfElement].className;
      this.currentlySelectedElement[indexOfElement].className = className.replace("list-item-selected", "")
      this.currentlySelectedElement.splice(indexOfElement, 1);
      return;
    }

    //If any conditions above doesn't match, it  add  element to list
    htmlElement.className += " list-item-selected"

    this.currentlySelectedElement.push(htmlElement)

  }

  deselectAll() {
    this.currentlySelectedElement.forEach(element => {
      const className: string = element.className;
      element.className = className.replace("list-item-selected", "")
    })

    this.currentlySelectedElement = [];
  }

  pasteToRoot() {
    let itemToBePastedId = Number(this.cuttedAlgorithmItems[0].id);
    let itemToBePasted = this.getAlgorithmItem(itemToBePastedId);
    this.deleteItem(itemToBePastedId);
    this.newPattern.algorithm.push(itemToBePasted!);
    this.cuttedAlgorithmItems = [];
  }

  OnDeleteClick() {
    this.currentlySelectedElement.forEach(element => {
      this.deleteItem(Number(element.id))
    })

    this.currentlySelectedElement = [];

  }

  addOr() {
    let newOrItem = new AlgorithmItem(this.getUniqueId())
    newOrItem.type = "or";

    this.newPattern.algorithm.push(newOrItem);
  }

  addWithin(){
    let newWithinType = new AlgorithmItem(this.getUniqueId())
    newWithinType.type = "Within";
    newWithinType.value = "10000";

    this.newPattern.algorithm.push(newWithinType);
  }

  deleteItem(algorithmItemId: number) {
    let index = this.newPattern.algorithm.findIndex(x => x.id === algorithmItemId)
    if (index !== -1) {
      this.newPattern.algorithm.push(...this.newPattern.algorithm[index].members)
      this.newPattern.algorithm.splice(index, 1);
    }
    else {
      this.newPattern.algorithm.forEach(item => {
        this.removeAlgorithmItem(algorithmItemId, item);
      })
    }
  }

  cutMessage() {
    this.cuttedAlgorithmItems.push(this.currentlySelectedElement[0])
    this.currentlySelectedElement = [];
    const className: string = this.cuttedAlgorithmItems[0].className;
    this.cuttedAlgorithmItems[0].className = className.replace("list-item-selected", "list-item-cutted");

    // let selectedAlgorithmId = Number(this.currentlySelectedElement[0].id);




    // let algorithmItem = this.newPattern.algorithm.find(x=>x.id === selectedAlgorithmId);

    // if (algorithmItem)
    // {
    //   this.cuttedAlgorithmItems.push(algorithmItem);
    // }
    // else{
    //   this.newPattern.algorithm.forEach(element=>
    //     {
    //       let output = this.getAlgorithmItem(selectedAlgorithmId,element);
    //       if(output)
    //       {
    //         this.cuttedAlgorithmItems.push(output);
    //       }
    //     })
    // }

  }

  paste() {
    let itemCutted;
    let itemToPaste;
    let cuttedAlgorithmId = Number(this.cuttedAlgorithmItems[0].id);
    let itemToPasteId = Number(this.currentlySelectedElement[0].id);

    itemCutted = this.getAlgorithmItem(cuttedAlgorithmId);

    if (!itemCutted) { return; }

    itemToPaste = this.getAlgorithmItem(itemToPasteId);

    this.deleteItem(cuttedAlgorithmId)
    this.cuttedAlgorithmItems = [];
    this.addItemToAlgorithmItem(itemCutted, itemToPasteId);
    this.deselectAll();
  }

  isParentElement(childId: Number, parentId: Number): boolean {
    let output = false;
    this.newPattern.algorithm.forEach(element => {
      if (element.id === parentId && element.members.find(x => x.id === childId)) {
        output = true;
      }
      else {
        element.members.forEach(innerElement => {
          output = this.isParentElementRecursive(childId, parentId, innerElement) == true ? true : output;
        })
      }
    })
    return output;
  }
  isParentElementRecursive(childId: Number, parentId: Number, algorithmItem: AlgorithmItem): boolean {
    let output = false;

    if (algorithmItem.id === parentId && algorithmItem.members.find(x => x.id === childId)) {
      return true;
    }
    else {
      algorithmItem.members.forEach(element => {
        output = this.isParentElementRecursive(childId, parentId, element) == true ? true : output;
      })
    }
    return output;
  }

  addItemToAlgorithmItem(itemToBeAdded: AlgorithmItem, itemIdToPaste: number) {
    this.newPattern.algorithm.forEach(element => {
      if (element.id === itemIdToPaste) {
        element.members.push(itemToBeAdded);
      }
      else {
        this.addItemToAlgorithmItemRecursive(itemToBeAdded, itemIdToPaste, element);
      }
    })
  }

  addItemToAlgorithmItemRecursive(itemToBeAdded: AlgorithmItem, itemIdToPaste: number, algorithmItem: AlgorithmItem) {
    if (algorithmItem.id === itemIdToPaste) {
      algorithmItem.members.push(itemToBeAdded);
    }
    else {
      algorithmItem.members.forEach(element => {
        this.addItemToAlgorithmItemRecursive(itemToBeAdded, itemIdToPaste, element);
      })
    }
  }


  CancelCut() {
    const className: string = this.cuttedAlgorithmItems[0].className;
    this.cuttedAlgorithmItems[0].className = className.replace("list-item-cutted", "list-item-selected");
    this.currentlySelectedElement.push(this.cuttedAlgorithmItems[0]);
    this.cuttedAlgorithmItems = [];

  }

  getAlgorithmItem(algorithmItemId: number) {
    let result;
    this.newPattern.algorithm.forEach(element => {
      let output = this.getAlgorithmItemRecursive(algorithmItemId, element);
      if (output) {
        result = output;
      }
    })

    return result;
  }

  getAlgorithmItemRecursive(algorithmItemId: Number, algorithmItem: AlgorithmItem) {
    let result;

    if (algorithmItem.id === algorithmItemId) {
      result = algorithmItem;
    }
    else {
      algorithmItem.members.forEach(element => {
        let output = this.getAlgorithmItemRecursive(algorithmItemId, element);
        if (output) {
          result = output;
        }
      });
    }

    return result;
  }

  moveBy(changeIndexBy: number) {

    let index = this.newPattern.algorithm.findIndex(x => x.id == Number(this.currentlySelectedElement[0].id));

    if (index !== -1) {
      let newPossition = changeIndexBy + index;
      let maxIndex = this.newPattern.algorithm.length - 1;
      if ((index != 0 && newPossition >= 0) || //<- if move up is possible
        (index != maxIndex && newPossition <= maxIndex)) // <- if move down is possible
      {
        let from = this.newPattern.algorithm.splice(index, 1)[0];
        this.newPattern.algorithm.splice(newPossition, 0, from);
      }
    }
    else {
      this.newPattern.algorithm.forEach(element => {
        this.moveAlgorithmItemBy(element, changeIndexBy);
      });
    }


  }

  moveAlgorithmItemBy(algorithmItem: AlgorithmItem, changeIndexBy: number) {
    let index = algorithmItem.members.findIndex(x => x.id == Number(this.currentlySelectedElement[0].id));

    if (index !== -1) {
      let newPossition = changeIndexBy + index;
      let maxIndex = algorithmItem.members.length - 1;
      if ((index != 0 && newPossition >= 0) || //<- if move up is possible
        (index != maxIndex && newPossition <= maxIndex)) // <- if move down is possible
      {
        let from = algorithmItem.members.splice(index, 1)[0];
        algorithmItem.members.splice(newPossition, 0, from);
      }
    }
    else {
      algorithmItem.members.forEach(element => {
        this.moveAlgorithmItemBy(element, changeIndexBy);
      });
    }
  }


  removeAlgorithmItem(id: number, algorithmItem: AlgorithmItem): void {
    let index = algorithmItem.members.findIndex(x => x.id === id);

    if (index !== -1) {
      algorithmItem.members.push(...algorithmItem.members[index].members);
      algorithmItem.members.splice(index, 1);
    }
    else {
      algorithmItem.members.forEach(element => {
        this.removeAlgorithmItem(id, element);
      });
    }
  }

  patternMap(input: string): string {
    if (input.includes("*")) {
      if (input.startsWith("*") && input.endsWith("*"))
        return "Contains"
      if (input.startsWith("*"))
        return "Starts with"
      if (input.endsWith("*"))
        return "End with"
    }
    return "Equals"
  }

  pairDefinitionWithAlgorithm(algorithm: AlgorithmItem, definition: DefinitionItem[]
  ) {
    if (algorithm.type.includes("event") || algorithm.type.includes("Event")) {
      let eventToReturn = definition.find(x => x.id.toString() === algorithm.value)
      return eventToReturn
    }
    return;
  }

  getDefinitionIdFromAlgorithmItemId(algorithmItem: AlgorithmItem, algorithmItemId: number) {
    let result;

    if (algorithmItem.id === algorithmItemId) {
      result = this.newPattern.definition.find(x => x.id === Number(algorithmItem.value));
    }

    else {
      algorithmItem.members.forEach(element => {
        let output = this.getDefinitionIdFromAlgorithmItemId(element, algorithmItemId);
        if (output) {
          result = output;
        }
      });
    }
    return result
  }

  terminateEvent() {
    const algorithmItem: AlgorithmItem = this.getAlgorithmItem(parseInt(this.currentlySelectedElement[0].id)) as unknown as AlgorithmItem

    if (algorithmItem.type.includes("event"))
      algorithmItem.type = "terminateEvent"
    else
      algorithmItem.type = "event"
  }

  addTestData(): void {

    let definitionItem: DefinitionItem[] = [
      {
        id: 7,
        name: "waterValue",
        conditions:
          [
            { "source": "EMH.Message", "pattern": "Water Value Received" }
          ]
      },
      {
        id: 8,
        name: "expRelease",
        conditions:
          [
            { source: "EMH.ID", "pattern": "UIS_02005_EXP_RELEASE_SVC*" },
            { source: "EMH.Message", "pattern": "*VK = 1, HK = 1*" },
            { source: "VK", pattern: "*1" }
          ]
      },
      {
        id: 9,
        name: "imageStoreFailed",
        conditions:
          [
            { "source": "EMH.", "pattern": "*image not stored" }
          ]
      }
    ]

    let algorithmItem: AlgorithmItem[] = [
      {
        id: 1,
        type: "within",
        value: "10000",
        members:
          [
            {
              id: 2,
              type: "or",
              value: "",
              members:
                [
                  {
                    id: 3,
                    type: "event",
                    value: "7",
                    members: []
                  },
                  {
                    id: 4,
                    type: "event",
                    value: "8",
                    members: []
                  },
                ]
            },
            {
              id: 5,
              type: "terminateEvent",
              value: "9",
              members: []
            }
          ]
      },
      {
        id: 6,
        type: "terminateEvent",
        value: "9",
        members: []
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
