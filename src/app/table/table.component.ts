import { Component, Input, OnInit, SecurityContext, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PatternsApiService } from '../services/patterns-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { Pattern } from '../models/pattern';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogRemovePatternComponent } from '../dialog-remove-pattern/dialog-remove-pattern.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import exportFromJSON from 'export-from-json'
import { DownloadJson } from '../models/DownloadJson';
import { AuthService } from '../security/auth.service';
import { formatDate } from '@angular/common';
import { SignalrService } from '../services/signalr.service';
import { JsonHandling } from '../services/json-handling.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<Pattern> = new MatTableDataSource<Pattern>([]);
  selection = new SelectionModel<Pattern>(true, []);
  filterText = '';
  pageSize: number;
  fileURL: string | null;

  isLoggedIn = true;

  @ViewChild(MatTable) table: MatTable<Pattern>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public patternsApiService: PatternsApiService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private signalRService: SignalrService,
    private jsonHandling:JsonHandling) {

    this.displayedColumns.length = 17;
    // The first two columns should be position and name; the last two columns: weight, symbol
    this.displayedColumns[0] = 'select';
    this.displayedColumns[1] = 'id';
    this.displayedColumns[2] = 'patternName';
    this.displayedColumns[3] = 'logMessage';
    this.displayedColumns[4] = 'dataSource';
    this.displayedColumns[5] = 'imPmNumber';
    this.displayedColumns[6] = 'defect';
    this.displayedColumns[7] = 'errorDescription';
    this.displayedColumns[8] = 'offlineLogReaderPattern';
    this.displayedColumns[9] = 'notes';
    this.displayedColumns[10] = 'resultsInError';
    this.displayedColumns[11] = 'workaround';
    this.displayedColumns[12] = 'components';
    this.displayedColumns[13] = 'foundIn';
    this.displayedColumns[14] = 'solvedIn';
    this.displayedColumns[15] = 'skb';
    this.displayedColumns[16] = 'functions';
  }
  ngOnInit(): void {
    this.authService.isLoggedIn().then(loggedIn => {
      console.log("1")
      this.isLoggedIn = loggedIn;
    });

    this.authService.loginChanged.subscribe(isLoggedIn => {
      console.log("2")
      this.isLoggedIn = isLoggedIn;
    });

    var pageSize = localStorage.getItem('pageSize');

    if (!pageSize) {
      this.pageSize = 10;
      localStorage.setItem('pageSize', 10 + '');
    }
    else {
      this.pageSize = Number(pageSize);
    }
    this.getPatterns();

    this.signalRService.hubConnection?.on('UpdateNotification', () => {
      this.getPatterns();
    });
  }

  getPatterns(): void {
    this.patternsApiService.getPatterns()
      .subscribe((data: Pattern[] | undefined) => {
        if (data) {
          this.dataSource = new MatTableDataSource<Pattern>(data);
          this.paginator.pageSize = this.pageSize;
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  applyFilter(filterValue: Event): void {
    this.filterText = (filterValue.target as HTMLInputElement).value.trim();
    this.dataSource.filter = this.filterText.toLowerCase();
  }

  addData(): void {
    this.router.navigateByUrl("/edit");
  }

  regainAccessToken() {
    this.authService.regainAccessToken();
  }

  downloadAll() {
    this.patternsApiService.getDownload().subscribe((result: DownloadJson[] | undefined) => {
      if (!!result) {
        const data = result;
        const fileName = 'Patterns_' + formatDate(new Date(), 'hhmm_ddMMyyyy', 'en');
        const exportType = 'json'

        exportFromJSON({ data, fileName, exportType })
      }
    });
  }

  downloadSelected() {
    /*var selected: number[] = [];
    for (var i = 0; i < this.selection.selected.length; i++) {
      selected.push(this.selection.selected[i].id)
    }*/
    /*
    this.patternsApiService.getDownloadSelected(selected).subscribe((result: DownloadJson[] | undefined) => {
      if (!!result) {
        const data = result;
        const fileName = 'download'
        const exportType = 'json'

        exportFromJSON({ data, fileName, exportType })
      }
    });*/
    const selected = this.selection.selected
    this.jsonHandling.exportPatternToJsonDownload(selected[0])
  }

  openDialog(id: number) {
    const dialogRef = this.dialog.open(DialogRemovePatternComponent, { data: { text: 'Would you like to delete pattern?', yes: 'yes', no: 'no', id: id } });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.patternsApiService.deletePattern(id).subscribe(() => {
          this.getPatterns();
        });
      }
    });
  }

  isAllSelected() {
    if (this.dataSource.data && this.selection) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }

    return false;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Pattern): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  onPaginateChange(event: PageEvent) {
    localStorage.setItem('pageSize', event.pageSize + '');
  }

  refresh() {
    this.getPatterns();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout().then( ()=>
      window.location.reload()
    );
    
  }
}
