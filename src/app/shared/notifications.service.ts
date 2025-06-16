import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private snackBar = inject(MatSnackBar);

  showMatSnackBar(
    message: string,
    type: 'success' | 'error' = 'success',
    action: string = 'Закрыть',
    duration?: number
  ) {
    this.snackBar.open(message, action, {
      duration: duration ?? 5000,
      panelClass: `snackbar-${type}`
    });
  }
}
