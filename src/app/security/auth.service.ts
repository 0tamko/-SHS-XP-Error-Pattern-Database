import { Injectable } from '@angular/core';
import { UserManager, User } from 'oidc-client';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

interface regainAccessTokenResponse {
  access_token: string,
  refresh_token: string,
  id_token: string,
  token_type: string,
  expires_in: number
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userManager: UserManager;
  private user: User;
  private loginChangedSubject = new Subject<boolean>();

  loginChanged = this.loginChangedSubject.asObservable();

  constructor(private cookieService: CookieService, private http: HttpClient) {

    const stsSettings = {
      authority: environment.stsAuthority,
      client_id: environment.clientId,
      redirect_uri: `${environment.clientRoot}signin-callback`,
      scope: 'openid profile offline_access',
      response_type: 'code',
    };

    this.userManager = new UserManager(stsSettings);
    this.userManager.events.addAccessTokenExpiring(() => {
      this.regainAccessToken();
    });
    this.userManager.events.addAccessTokenExpired(() => {
      this.loginChangedSubject.next(false);
    });
  }

  login() {
    return this.userManager.signinRedirect();
  }

  logout() {
    this.cookieService.delete('Authorization');
    return this.userManager.removeUser();
  }

  regainAccessToken() {
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.clientId)
      .set('refresh_token', this.cookieService.get('refresh_token'));

    this.http.post<regainAccessTokenResponse>(environment.tokenEndpoint, body, { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) })
      .subscribe(result => {
        console.log(result);
        this.cookieService.set('Authorization', 'Bearer ' + result.access_token, undefined, undefined, undefined, false, `None`);
        if (result.refresh_token)
          this.cookieService.set('refresh_token', result.refresh_token);
      });
  }

  isLoggedIn(): Promise<boolean> {
    return this.userManager.getUser().then(user => {
      console.log(user)
      const userCurrent = !!user && !user.expired;
      if (user) {
        if (this.user !== user) {
          this.loginChangedSubject.next(userCurrent);
        }
        this.user = user;
        return userCurrent;
      }

      return false;
    });
  }

  completeLogin() {
    return this.userManager.signinRedirectCallback().then(user => {
      this.user = user;
      this.loginChangedSubject.next(!!user && !user.expired);
      console.log('Refresh token: ' + user.refresh_token);
      this.cookieService.set('Authorization',  user.access_token, undefined, undefined, undefined, false, `None`);
      if (user.refresh_token)
        this.cookieService.set('refresh_token', user.refresh_token);

      return user;
    });
  }

  getAccessToken(): Promise<string | null> {
    return this.userManager.getUser().then(user => {
      if (!!user && !user.expired) {

        return user.access_token;
      }
      else {
        return null;
      }
    });
  }
}
