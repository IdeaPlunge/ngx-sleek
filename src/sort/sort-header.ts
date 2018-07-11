import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    OnInit,
    Input,
    // ChangeDetectorRef,
    Optional,
    HostListener,
    Renderer2
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { SlkColumnDefDirective } from '../new-grid';
import { SlkSortDirective } from './sort';
import { take } from 'rxjs/operators';
import { SortDirectiveService } from './sort-directive.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';

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

    @ViewChild('sortBtn') sortBtn: ElementRef;

    constructor(
        // changeDetectorRef: ChangeDetectorRef,
        @Optional() public _sort: SlkSortDirective,
        @Optional() public _slkColumnDef: SlkColumnDefDirective,
        private renderer: Renderer2,
        private sortDirService: SortDirectiveService
    ) { }

    /** Click event. When clicked will sort the data passing reference of this component to sort directive. */
    @HostListener('click', ['$event'])
    onSort() {
        this._sort.sort(this);

        this.sortDirService.finalDir
            .pipe(take(1))
            .subscribe((direction) => {
                switch (direction) {
                    case 'asc':
                        this.renderer.removeClass(this.sortBtn.nativeElement, 'slk-sort-header-pointer-down');
                        this.renderer.addClass(this.sortBtn.nativeElement, 'slk-sort-header-pointer-up');
                        return;
                    case 'desc':
                        this.renderer.removeClass(this.sortBtn.nativeElement, 'slk-sort-header-pointer-up');
                        this.renderer.addClass(this.sortBtn.nativeElement, 'slk-sort-header-pointer-down');
                        return;
                    default:
                        this.renderer.addClass(this.sortBtn.nativeElement, 'slk-sort-header-pointer-down');
                        return;
                }
            });
    }

    ngOnInit() {
        if (!this.id && this._slkColumnDef) {
            this.id = this._slkColumnDef.name;
        }
        this._sort.register(this);
    }
    ngOnDestroy() {
        this._sort.deregister(this);
        // this._rerenderSubscription.unsubscribe();
    }

    /** Returns the animation state for the arrow direction. */
    _isSorted() {
        return this._sort.active === this.id &&
            (this._sort.direction === 'asc' || this._sort.direction === 'desc');
    }
}
