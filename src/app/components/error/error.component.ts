import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-error',
  imports: [MatButton],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
  constructor(private auth: AuthService, private router:Router) {

  }
  redirect() {
    if(this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard'])
    } else {
      this.router.navigate(['/'])
    }
  }
}
