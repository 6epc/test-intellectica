import { ApiService } from './../../shared/api.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { map, Observable, switchMap, take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

import { PassRequest } from '../../shared/models.interface';
import { NotificationsService } from './../../shared/notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../shared/auth.service';
import { StatusPipe } from '../../shared/status.pipe';

@Component({
  selector: 'app-request',
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule, StatusPipe],
  templateUrl: './request.component.html',
  styleUrl: './request.component.scss',
})
export class RequestComponent {
  request$!: Observable<PassRequest>;
  private requestLocalId!: number;
  private currentUserId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private destroyRef: DestroyRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.requestLocalId = +this.route.snapshot.params['localId']; // Получаем localId из URL
    this.currentUserId = this.authService.getCurrentUser().id;
    this.loadRequest();
  }

  loadRequest() {
    // Получаем все заявки пользователя и находим по localId
    this.request$ = this.apiService.getUserRequests(this.currentUserId).pipe(
      map((requests) => {
        const foundRequest = requests.find(
          (req) => req.localId === this.requestLocalId
        );
        if (!foundRequest) {
          this.router.navigate(['/dashboard']);
          throw new Error('Заявка не найдена');
        }
        return foundRequest;
      })
    );
  }

  startApproval() {
    // Для методов, работающих с API, нам нужно сначала получить реальный id
    this.request$
      .pipe(
        take(1),
        switchMap((request) => {
          return this.apiService.startApproval(request.id)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationsService.showMatSnackBar(
            'Заявка отправлена на согласование',
            'success',
            'Закрыть',
            3000
          );
          this.loadRequest();
        },
      });
  }

  confirmIssuance() {
    this.request$
      .pipe(
        take(1),
        switchMap((request) => {
          return this.apiService.confirmIssuance(request.id)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadRequest());
  }

  logout() {
    this.authService.logout();
  }
}
