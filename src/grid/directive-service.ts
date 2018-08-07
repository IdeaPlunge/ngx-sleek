import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DirectiveService {
    private totalColumns = new BehaviorSubject<number>(0);
    totalColumnsAsObservable: Observable<number> = this.totalColumns.asObservable();
    setTotalColumns(columns: any[]) {
        this.totalColumns.next(columns.length);
    }
}
