import { Component, DestroyRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../shared/auth.service';
import { NotificationsService } from '../../shared/notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private destroyRef:DestroyRef
  ) {
    this.loginForm = this.fb.group({
      email: ['1234@mail.ru', [Validators.required, Validators.email]],
      password: ['111111', Validators.required],
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }
  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.authService
      .login(this.loginForm.value.email!, this.loginForm.value.password!).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (u) => {
          this.notificationsService.showMatSnackBar(
            `Добро пожаловать, ${u.fullName}`,
            'success',
            'Закрыть',
            3000
          );
        },
        error: (err) => {
          if (err.status === 401) {
            this.notificationsService.showMatSnackBar(
              err.error.error,
              'error',
              'Закрыть',
              5000
            );
          } else {
            this.notificationsService.showMatSnackBar(
              'Что-то пошло не по плану',
              'error',
              'Закрыть',
              5000
            );
          }
        },
      });
  }
}
