import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-signin-redirect-callback',
  template: `<div>Redirecting...</div>`
})
export class SigninRedirectCallbackComponent implements OnInit {

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    
    this.authService.completeLogin().then(user => {
      
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }

}
