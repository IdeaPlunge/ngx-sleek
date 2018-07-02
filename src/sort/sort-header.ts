import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    OnInit,
    Input,
    ChangeDetectorRef,
    Optional,
    HostListener
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { SlkColumnDefDirective } from '../new-grid';
import { SlkSortDirective } from './sort';

export type SortDirection = 'asc' | 'desc' | '';

@Component({
    selector: '[slk-sort-header]',
    exportAs: 'sortHeader',
    templateUrl: 'sort-header.html',
    styleUrls: ['sort-header.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlkSortHeaderComponent implements OnDestroy, OnInit {
    private _rerenderSubscription: Subscription;
    /** The direction the pointer should face as per sorted direction */
    pointerDirection: SortDirection;

    /** ID of the sort-header. When used with slkColumnDef, will default to column's name. */
    @Input('slk-sort-header') id: string;
    /** Overrides the sort start value of the containing SlkSort for this SlkSortable. */
    @Input() start: 'asc' | 'desc';

    /** Click event. When clicked will sort the data passing reference of this component to sort directive. */
    @HostListener('click', ['$event'])
    onSort() {
        this._sort.sort(this);
    }

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        @Optional() public _sort: SlkSortDirective,
        @Optional() public _slkColumnDef: SlkColumnDefDirective
    ) { /** console.log('test from sort'); */ }

    ngOnInit() {
        if (!this.id && this._slkColumnDef) {
            this.id = this._slkColumnDef.name;
        }
        this._sort.register(this);
    }
    ngOnDestroy() {
        this._sort.deregister(this);
        this._rerenderSubscription.unsubscribe();
    }

    /** Triggers the sort on this sort header and removes the indicator hint. */
    _handleClick() {
        this._sort.sort(this);
    }
    /** Returns the animation state for the arrow direction. */
    _isSorted() {
        // console.log('isSorted');
        return this._sort.active === this.id &&
            (this._sort.direction === 'asc' || this._sort.direction === 'desc');
    }
}
