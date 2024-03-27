import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { PatternsApiService } from "./services/patterns-api.service";

@Injectable({ providedIn: 'root' })
export class PatternResolver implements Resolve<any> {

  constructor(private service: PatternsApiService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any>  {

    return this.service.getPattern(route.paramMap.get('id') + '');
  }

}
