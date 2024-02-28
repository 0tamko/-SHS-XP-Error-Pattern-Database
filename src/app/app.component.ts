import { Component } from '@angular/core';
import { MatTooltipDefaultOptions } from '@angular/material/tooltip';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {



}

export const patternToolTipOptions: MatTooltipDefaultOptions = {
  showDelay: 300,
  hideDelay: 100,
  touchendHideDelay: 100,
  position : 'above',
};