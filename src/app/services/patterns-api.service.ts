import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { Pattern } from '../models/pattern';
import { environment } from '../../environments/environment';
import { DownloadJson } from '../models/DownloadJson';
import { AuthService } from '../security/auth.service';
import { CookieService } from 'ngx-cookie-service';

///Cookies which contains access token are not attachet to API requests on Chromium (only on mozzila), that's why access token is copied also to headers
@Injectable({
  providedIn: 'root'
})
export class PatternsApiService {

  constructor(private cookieService: CookieService, private http: HttpClient, private authService: AuthService) { }

  public getPattern(id: string): Observable<Pattern | undefined> {
    const headers = this.GetAccessTokenFromCookies();
    return this.http.get<Pattern>(environment.baseUrl + "/api/patterns/" + id, { headers: headers, withCredentials: true });
  }


  public getPatterns(): Observable<Pattern[] | undefined> {
    const headers = this.GetAccessTokenFromCookies();
    return this.http.get<Pattern[]>(environment.baseUrl + "/api/patterns/", { headers: headers, withCredentials: true });
  }

  public updatePattern(id: number, pattern: Pattern) {
    const headers = this.GetAccessTokenFromCookies();
    return this.http.put<any>(environment.baseUrl + "/api/patterns/" + id, pattern, { headers: headers, withCredentials: true });
  }

  public addPattern(pattern: Pattern) {
    const headers = this.GetAccessTokenFromCookies();
    return this.http.post<any>(environment.baseUrl + "/api/patterns/", pattern, { headers: headers, withCredentials: true });
  }

  public deletePattern(id: number) {
    const headers = this.GetAccessTokenFromCookies();
    return this.http.delete<any>(environment.baseUrl + "/api/patterns/" + id, { headers: headers, withCredentials: true });
  }

  public getDownload(): Observable<DownloadJson[] | undefined> {
    const headers = this.GetAccessTokenFromCookies();
    return this.http.get<DownloadJson[]>(environment.baseUrl + "/api/patterns/download", { headers: headers, withCredentials: true });
  }

  public getDownloadSelected(ids: number[]): Observable<DownloadJson[] | undefined> {

    let params = new HttpParams();
    for (var i = 0; i < ids.length; i++) {
      params = params.append('ids', ids[i]);
    }

    const headers = this.GetAccessTokenFromCookies();
    return this.http.get<DownloadJson[]>(environment.baseUrl + "/api/patterns/download/selected", { params: params, headers: headers, withCredentials: true });
  }

  private GetAccessTokenFromCookies() {
    let tokenFromCookies = this.cookieService.get('Authorization');
    return new HttpHeaders().set('Authorization', tokenFromCookies);
  }

}
