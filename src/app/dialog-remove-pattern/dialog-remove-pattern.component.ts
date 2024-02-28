import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

export interface DialogData {
  text: '',
  yes: 'yes',
  no: 'no'
}

@Component({
  selector: 'app-dialog-remove-pattern',
  templateUrl: './dialog-remove-pattern.component.html',
  styleUrls: ['./dialog-remove-pattern.component.css']
})
export class DialogRemovePatternComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dialogRef: MatDialogRef<DialogRemovePatternComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

}
