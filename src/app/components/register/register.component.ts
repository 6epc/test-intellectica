import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInput, MatInputModule } from '@angular/material/input';

import { AuthService } from '../../shared/auth.service';
import { NotificationsService } from '../../shared/notifications.service';
import { matchPasswordValidator } from '../../shared/custom.validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
    RouterModule,
  ],
})
export class RegisterComponent {
  @ViewChild('emailField', { read: MatInput }) emailField!: MatInput;
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationsService: NotificationsService,
    private destroyRef:DestroyRef
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(6)]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+[0-9]{11,15}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      organization: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [
        '',
        [Validators.required, matchPasswordValidator('password')],
      ],
    });
  }

  get fullName() {
    return this.registerForm.get('fullName')!;
  }
  get phone() {
    return this.registerForm.get('phone')!;
  }
  get email() {
    return this.registerForm.get('email')!;
  }
  get organization() {
    return this.registerForm.get('organization')!;
  }
  get password() {
    return this.registerForm.get('password')!;
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  toCapitalCase = (str: string) => {
    return str
      .split(' ')
      .map((word) => `${word[0]?.toUpperCase()}${word.slice(1)}`)
      .join(' ');
  };

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Пожалуйста, заполните все поля корректно.';
      return;
    }

    const visitor = {
      ...this.registerForm.value,
      fullName: this.toCapitalCase(this.fullName.value),
    };

    this.authService.register(visitor).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationsService.showMatSnackBar(
            'Регистрация успешна',
            'success',
            'Закрыть',
            3000
          );
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.status === 400 && err.error.error === 'email_exists') {
            this.notificationsService.showMatSnackBar(
              'Этот email уже зарегистрирован',
              'error',
              'Закрыть',
              5000
            );
            this.email.setErrors({ duplicate: true });
            this.emailField.focus();
          }

          if (err.error.error !== 'email_exists') {
            this.notificationsService.showMatSnackBar(
              'Не понятная ошибка, скоро вернемся',
              'error',
              'Закрыть',
              5000
            );
          }
        },
    });
  }
}
