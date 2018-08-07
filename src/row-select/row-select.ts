import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnInit,
    Output,
    EventEmitter,
    OnDestroy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'slk-select-row',
    templateUrl: 'row-select.html',
    styleUrls: ['row-select.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SlkSelectRowComponent implements OnInit, OnDestroy {
    _initialised = new BehaviorSubject<boolean>(false);
    @Output() rowSelect: EventEmitter<any> = new EventEmitter();

    constructor() {

    }

    ngOnInit() {
        this._initialised.next(true);
    }
    ngOnDestroy() {
        this._initialised.complete();
    }
}
