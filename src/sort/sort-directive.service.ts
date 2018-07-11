import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SortDirectiveService {
    private direction = new BehaviorSubject<string>('');
    finalDir: Observable<string> = this.direction.asObservable();
    catchFinalDir(dir: string) {
        this.direction.next(dir);
    }
}
