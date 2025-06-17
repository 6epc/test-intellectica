import { Pipe, PipeTransform } from '@angular/core';
import { Status, StatusClassMap } from './models.interface';

@Pipe({
  name: 'statusClass',
  pure: false
})
export class StatusPipe implements PipeTransform {
  private statusClassMap: StatusClassMap = {
    [Status.PENDING]: 'status-pending',
    [Status.READY]: 'status-ready',
    [Status.REJECTED]: 'status-rejected',
    [Status.ISSUED]: 'status-issued',
  };

  transform(status: Status | string): string  {
    return this.statusClassMap[status as Status] || '';
  }
}
