import { Component, Inject, OnInit } from '@angular/core';
import { AlgorithmItem } from '../models/PatternDefinitionJson';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-type',
  templateUrl: './dialog-edit-type.component.html',
  styleUrls: ['./dialog-edit-type.component.css']
})
export class DialogEditTypeComponent implements OnInit {

  newWithinType : AlgorithmItem;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AlgorithmItem) 
    {
      this.newWithinType = Object.assign({},data);
    }  
  
  ngOnInit(): void {
    this.newWithinType.type = "Within";

  }

}
