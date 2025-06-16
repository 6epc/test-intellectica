import { environment } from './../../environments/environment.development';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, Observable, switchMap, tap, timer } from 'rxjs';
import { PassRequest } from './models.interface';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http:HttpClient ) {}

  getRequest(requestId: number): Observable<PassRequest> {
    return this.http.get<PassRequest>(`${environment.apiUrl}/requests/${requestId}`);
  }

  // Обновление статуса (запускает симуляцию)
  startApproval(requestId: number): Observable<PassRequest> {
    return this.http.patch<PassRequest>(`${environment.apiUrl}/requests/${requestId}`, {
      status: "в обработке" // Триггер для симуляции
    });
  }

  // Подтверждение выдачи пропуска
  confirmIssuance(requestId: number): Observable<PassRequest> {
    return this.http.patch<PassRequest>(`${environment.apiUrl}/requests/${requestId}`, {
      status: "пропуск выдан"
    });
  }

  getUserRequests(userId: number): Observable<PassRequest[]> {
    return this.http.get<PassRequest[]>(`${environment.apiUrl}/requests?userId=${userId}`);
  }

  createRequest(request: PassRequest):Observable<PassRequest>  {
    return this.http.post<PassRequest>(`${environment.apiUrl}/requests`, request);
  }
}
