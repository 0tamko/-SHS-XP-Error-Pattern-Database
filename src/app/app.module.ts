import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HighlightSearchPipe } from './highlight-search.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NewPatternComponent } from './new-pattern/new-pattern.component';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogRemovePatternComponent } from './dialog-remove-pattern/dialog-remove-pattern.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PatternResolver } from './pattern-resolver';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu'; 
import {MatIconModule} from '@angular/material/icon'; 
import { CookieService } from 'ngx-cookie-service';
import { DialogEditPatternComponent } from './dialog-edit-pattern/dialog-edit-pattern.component';
import {MatTabsModule} from '@angular/material/tabs'; 
import {MatTooltipModule} from '@angular/material/tooltip'; 
import {MatSelectModule} from '@angular/material/select';
import { DialogEditTypeComponent } from './dialog-edit-type/dialog-edit-type.component'; 


const routes: Routes = [
  { path: 'table', component: TableComponent , canActivate: [] },
  { path: 'edit/:id', component: NewPatternComponent, resolve: { pattern: PatternResolver } },
  { path: 'edit', component: NewPatternComponent },
  { path: '', redirectTo: '/table', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    HighlightSearchPipe,
    NewPatternComponent,
    TableComponent,
    DialogRemovePatternComponent,
    DialogEditPatternComponent,
    DialogEditTypeComponent
  ],
  imports: [
    MatIconModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule,
    HttpClientModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatCheckboxModule,
    FormsModule,
    MatListModule,
    MatTabsModule,
    MatTooltipModule,
    MatSelectModule,

    RouterModule.forRoot(routes, { useHash: false }),

  ],
  providers: [PatternResolver, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
