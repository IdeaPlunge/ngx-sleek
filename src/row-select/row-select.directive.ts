import {
    Directive,
    OnInit,
    EventEmitter,
    Output,
    OnDestroy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RowSelectService } from './row-select.service';

@Directive({
    selector: '[slkRowSelect]',
    exportAs: 'slkRowSelect'
})
export class SlkRowSelectDirective implements OnInit, OnDestroy {
    _initialised = new BehaviorSubject<boolean>(false);
    @Output() rowSelect: EventEmitter<any> = new EventEmitter();

    constructor(
        private rowSelectService: RowSelectService
    ) { }

    ngOnInit() {
        this._initialised.next(true);

        this.rowSelectService.catchInitialised(true);
    }
    ngOnDestroy() {
        this._initialised.complete();
    }
}
