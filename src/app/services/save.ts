import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Save {
  emitted = new Subject<void>();

  public emit(): void {
    this.emitted.next();
  }
}
