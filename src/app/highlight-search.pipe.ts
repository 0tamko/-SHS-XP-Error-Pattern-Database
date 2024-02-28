import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightSearch'
})
export class HighlightSearchPipe implements PipeTransform {

  transform(value: string, search: string): string {
    if (value === null || value === "undefined") {
      return '';
    }

    const resultStr = value + '';
    return resultStr.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<span class="highlightSearch">$1</span>');
  }

}
