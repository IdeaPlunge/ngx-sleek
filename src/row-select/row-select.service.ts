import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class RowSelectService {
    private initialised = new BehaviorSubject<boolean>(false);
    init: Observable<boolean> = this.initialised.asObservable();
    catchInitialised(bool: boolean) {
        this.initialised.next(bool);
    }
}
