import { Component, DestroyRef, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Observable, of, switchMap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationsService } from './../../shared/notifications.service';
import { PassRequest, RegisterUserInfo } from '../../shared/models.interface';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../shared/auth.service';
import { futureDateValidator } from '../../shared/custom.validators';
import { StatusPipe } from '../../shared/status.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
    MatTableModule,
    StatusPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  requestForm: FormGroup;
  dataSource$: Observable<PassRequest[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      visitorName: [''],
      visitDate: ['', [Validators.required, futureDateValidator]],
      purpose: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
    });
  }

  currentUser!: RegisterUserInfo;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.requestForm.patchValue({
      visitorName: this.currentUser.fullName,
    });

    this.dataSource$ = this.apiService.getUserRequests(this.currentUser.id);
  }

  get visitDate() {
    return this.requestForm.get('visitDate')!;
  }
  get purpose() {
    return this.requestForm.get('purpose')!;
  }

onSubmit() {
  if (this.requestForm.valid) {
    // Получаем текущий список заявок пользователя, чтобы определить следующий localId
    this.apiService.getUserRequests(this.currentUser.id).pipe(
      take(1), // Берем только последний результат
      switchMap(requests => {
        const nextLocalId = requests.length + 1; // Новый localId = текущее количество + 1

        const newRequest = {
          ...this.requestForm.value,
          userId: this.currentUser?.id,
          visitorName: this.currentUser.fullName,
          status: 'в обработке',
          createdAt: new Date().toISOString(),
          localId: nextLocalId // Добавляем localId
        };

        return this.apiService.createRequest(newRequest);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.dataSource$ = this.apiService.getUserRequests(this.currentUser.id);
        this.notificationsService.showMatSnackBar(
          'Заявка получена',
          'success',
          'Закрыть',
          3000
        );
        // Сброс формы
        Object.keys(this.requestForm.controls).forEach((key) => {
          const control = this.requestForm.get(key);
          control?.clearValidators();
          control?.updateValueAndValidity();
        });
        this.visitDate.reset();
        this.purpose.reset();
      },
      error: () => {
        this.notificationsService.showMatSnackBar(
          'Отправка не удалась',
          'error',
          'Закрыть',
          0
        );
      }
    });
  }
}

  navigateToReq(req:PassRequest) {
    this.router.navigate(['/dashboard', req.localId]);
  }

  logout() {
    this.authService.logout()
  }
}
