import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    ContentChild,
    TemplateRef,
    AfterContentInit,
    IterableDiffer,
    IterableDiffers,
    IterableChangeRecord,
    EmbeddedViewRef,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SlkNavDirective, SlkPageIndexDirective } from './page-nav';
import { ActionsService } from '../tree/tree-service';
import { takeUntil } from 'rxjs/operators';

/** Reference code */
// export const PAGINATOR_CHILD_TEMPLATE = `<ng-container appNavigator
// *ngTemplateOutlet="pageBtnTemplate, context: {$implicit: ctx}"></ng-container>`;
export const PAGINATOR_CHILD_TEMPLATE = `<ng-container slkNavigator></ng-container>`;

/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
    /** Current page index. */
    pageIndex: number;
    /** The current page size. */
    pageSize: number;
    /** The current total number of items being paged. */
    length: number;
}

export class PaginatorContext<T> {
    $implicit: T;
    constructor(data: T) {
        this.$implicit = data;
    }
}

let count = 0;
let actualCount = 0;

export const viewContainerRef = 'view-container-ref';

/** TODO:- Put Comments After every line */
@Component({
    selector: 'slk-paginator-child',
    template: PAGINATOR_CHILD_TEMPLATE,
    styleUrls: ['paginator.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class SlkPaginatorChildComponent implements OnInit, AfterContentInit {
    /** Total pages. */
    private _pages: any;
    /** Watches for the change. */
    private _dataDiffer: IterableDiffer<any>;

    public viewRefCollection: EmbeddedViewRef<any>[] = [];
    /** Gets the 'length' from parent component. */
    @Input()
    get length(): number { return this._length; }
    set length(value: number) {
        this._length = value;
    }
    private _length: number;

    /** Gets the 'pageSize' from parent component. */
    @Input()
    get pageSize(): number { return this._pageSize; }
    set pageSize(value: number) {
        this._pageSize = value;
    }
    private _pageSize: number;

    /** Queries 'SlkNavDirective' Gets the view container ref from 'SlkNavDirective'. */
    @ViewChild(SlkNavDirective) nav: SlkNavDirective;

    /** Queries whenever ContentChild changes. Read as TemplateRef. */
    @ContentChild(SlkPageIndexDirective, { read: TemplateRef }) pageBtnTemplate: TemplateRef<any>;

    constructor(
        private _differs: IterableDiffers,
        private cacheService: ActionsService
    ) { }

    ngOnInit() {
        this._dataDiffer = this._differs.find([]).create();
    }
    ngAfterContentInit() {
        this.renderIndex();
    }

    /** Inserts buttons as per total pages */
    private renderIndex() {
        // Get the count of pages to be displayed by the user.
        count = Math.ceil(this.length / this.pageSize);
        actualCount = count;
        // Makes a array to iterate over the total pages needed. Should not be more than 5 buttons.
        if (count > 5) {
            count = 7;
        } else {
            count = count + 2;
        }
        // console.log('count', count);
        const array = Array.from(Array(count).keys());
        // Gets the context in a array and the template to be inserted.
        this._pages = this._getAllIndexes(array);
        // Captures the changes in dataDiffer.
        const changes = this._dataDiffer.diff(this._pages);

        changes.forEachOperation(
            (record: IterableChangeRecord<any>, prevIndex: number, currenIndex: number) => {
                if (record.previousIndex === null) {
                    this.insertButtons(record.item);
                }
            }
        );

        this.cacheService.set(viewContainerRef, this.viewRefCollection);
    }

    private _getAllIndexes(indices: Array<any>): any[] {
        return indices.map((_, i) => {
            let pageNo: string, disabled: boolean;
            switch (i) {
                case 0:
                    pageNo = '<';
                    disabled = true;
                    break;
                case 1:
                    pageNo = i.toString();
                    disabled = true;
                    break;
                case indices.length - 1:
                    pageNo = '>';
                    disabled = false;
                    break;
                default:
                    pageNo = i.toString();
                    disabled = false;
                    break;
            }
            return {
                page: pageNo,
                temp: this.pageBtnTemplate,
                index: i,
                disabled: disabled
            };
        });
    }

    private insertButtons(data: any) {
        const ctxData = { page: data.page, index: data.index, disabled: data.disabled };
        const context = new PaginatorContext<any>(ctxData);
        const collectionViewRef = this.nav.viewContainer.createEmbeddedView(data.temp, context, data.index);
        this.viewRefCollection.push(collectionViewRef);
        // console.log('this.view', this.viewRefCollection);
    }
}

@Component({
    selector: 'slk-paginator',
    templateUrl: 'paginator.html',
    styleUrls: ['paginator.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class SlkPaginatorComponent implements
    OnInit,
    OnDestroy {

    public initialised: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Notifies when the component is destroyed. */
    _onDestroy: Subject<boolean> = new Subject();

    /** Gets the view ref collection. */
    collectedViewRef: EmbeddedViewRef<any>[] = [];

    /** Index of the page to be displayed. */
    @Input()
    get pageIndex(): number { return this._pageIndex; }
    set pageIndex(value: number) {
        this._pageIndex = value;
        this._changeDetectorRef.markForCheck();
    }
    private _pageIndex = 1;

    /** Length of total number of items that are being paginated. */
    @Input()
    get length(): number { return this._length; }
    set length(value: number) {
        this._length = value;
        this._changeDetectorRef.markForCheck();
    }
    private _length = 0;

    /** Number of items to be displayed on a page. Set a default value. */
    @Input()
    get pageSize(): number { return this._pageSize; }
    set pageSize(value: number) {
        this._pageSize = value;
    }
    private _pageSize: number;

    /** The set of provided page size options to display to the user. */
    @Input()
    get pageSizeOptions(): number[] { return this._pageSizeOptions; }
    set pageSizeOptions(value: number[]) {
        this._pageSizeOptions = (value || []).map(p => p);
    }
    private _pageSizeOptions: number[] = [];

    /** Event emitted when page changes. */
    @Output() readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

    /** Displayed set of page size options. */
    _displayedPageSizeOptions: number[];

    constructor(
        public _changeDetectorRef: ChangeDetectorRef,
        public cacheService: ActionsService
    ) { }

    ngOnInit() { this.initialised.next(true); }

    ngOnDestroy() {
        this.initialised.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    onPaged(index: number, page?: string) {
        // Increment or decrement 'pageIndex' as the user clicks on the buttons.
        if (index === 0) {
            this.pageIndex--;
        } else if (index === count - 1) {
            this.pageIndex++;
        } else {
            this.pageIndex = index;
        }
        // console.log('index', index);
        if (actualCount > count) {
            if (index === count - 1) {
                // Check if the pageIndex has reached the last button.
                if (this.pageIndex >= 5) {
                    // Now Change the context of currently available buttons
                    this.incrementButtonContext();
                    return;
                }
            }
            if (index === 0) {
                console.log(0);
                // Now Change the context of currently available buttons.
                this.decrementButtonContext(page);
                return;
            }
            if (index === 1) {
                console.log(1);
                this.collectedViewRef[1].context.$implicit.disabled = true;
                this._onPaged();
                return;
            }
        }
        /** Emits a event to update the data source. */
        this._onPaged();
        /** Changes contexts of button. */
        this.changeContextOfButtons(this.pageIndex);
    }
    /** Changes the context on reaching last index. */
    incrementButtonContext(): void {
        // Increase the page number by 1 to display.

        // Disable the right arrow if pageIndex has exceeded.
        if (this.pageIndex >= actualCount) {
            this.collectedViewRef[6].context.$implicit.disabled = true;
        }
        if (this.pageIndex === 5) {
            this.collectedViewRef[5].context.$implicit.disabled = true;
            this.collectedViewRef[4].context.$implicit.disabled = false;
        }
        // Not to be incremented if the last pageIndex is 5
        if (this.pageIndex !== 5) {
            for (let i = 0; i < this.collectedViewRef.length; i++) {
                // Increase the number of page by 1.
                if (i !== 0 && i !== 6) {
                    this.collectedViewRef[i].context.$implicit.page =
                        (parseInt(this.collectedViewRef[i].context.$implicit.page, 10) + 1).toString();
                    // Disable the currenlty selected pageIndex.
                    if (parseInt(this.collectedViewRef[i].context.$implicit.page, 10) === this.pageIndex) {
                        this.collectedViewRef[i].context.$implicit.disabled = true;
                    } else {
                        this.collectedViewRef[i].context.$implicit.disabled = false;
                    }
                }
            }
        }

        /** Emits a event to update the data source. */
        this._onPaged();
    }

    /** Changes the context on reaching previous index. */
    decrementButtonContext(page: string): void {
        // console.log('pageIndex', page);
        if (parseInt(page, 10) === 0) {
            // console.log('disabled decrement');
            this.collectedViewRef[0].context.$implicit.disabled = true;
        }
        for (let i = 0; i < this.collectedViewRef.length; i++) {
            // Decrease the number of page by 1.
            if (i !== 0 && i !== 6) {
                this.collectedViewRef[i].context.$implicit.page =
                    (parseInt(this.collectedViewRef[i].context.$implicit.page, 10) - 1).toString();
                // Disable the currently selected pageIndex.
                if (parseInt(this.collectedViewRef[i].context.$implicit.page, 10) === this.pageIndex) {
                    this.collectedViewRef[i].context.$implicit.disabled = true;
                } else {
                    this.collectedViewRef[i].context.$implicit.disabled = false;
                }
            }
        }

        /** Emits a event to update the data source. */
        this._onPaged();
    }

    _onPaged(): void {
        /** Emits a event to notify dataSource and update the page with right data. */
        this.page.emit({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            length: this.length
        });
    }

    /**
     * Disables the page buttons as per selected index desired by the user.
     */
    changeContextOfButtons(pageInd: number): void {
        // console.log('pageInd', pageInd);
        this.cacheService.get(viewContainerRef)
            .pipe(takeUntil(this._onDestroy))
            .subscribe((viewRef: EmbeddedViewRef<any>[]) => {

                // Store the viewRef in a property to be used by this class.
                this.collectedViewRef = viewRef;

                // Check if the currently selected page index is less than 1 and disable start 2 index page buttons
                // Check if the currently selected page index is equal or greater than the highest page index.
                // Check if the currently selected page index is in the middle or none or above
                if (pageInd === 5) {
                    for (let i = 0; i < viewRef.length; i++) {
                        if (i === 5) {
                            viewRef[i].context.$implicit.disabled = true;
                        } else {
                            viewRef[i].context.$implicit.disabled = false;
                        }
                    }
                }
                if (pageInd !== 5) {
                    if (pageInd > 1 && pageInd < viewRef.length - 2) {
                        this.enableAll(viewRef, pageInd);
                    } else if (pageInd >= viewRef.length - 2) {
                        this.disableEndIndex(viewRef);
                    } else {
                        this.disableStartIndex(viewRef);
                    }
                }

            });
    }
    /** Disables the button at the start indices. */
    disableStartIndex(viewRef: EmbeddedViewRef<any>[]): void {
        for (let i = 0; i < viewRef.length; i++) {
            if (i < 2) {
                viewRef[i].context.$implicit.disabled = true;
            } else {
                viewRef[i].context.$implicit.disabled = false;
            }
        }
    }
    /** Disables the button at the end indices. */
    disableEndIndex(viewRef: EmbeddedViewRef<any>[]): void {
        for (let i = 0; i < viewRef.length; i++) {
            if (i >= viewRef.length - 2) {
                viewRef[i].context.$implicit.disabled = true;
            } else {
                viewRef[i].context.$implicit.disabled = false;
            }
        }
    }
    /** Enables all the button. */
    enableAll(viewRef: EmbeddedViewRef<any>[], pageInd: number): void {
        for (let i = 0; i < viewRef.length; i++) {
            if (viewRef[i].context.$implicit.index === pageInd) {
                viewRef[i].context.$implicit.disabled = true;
            } else {
                viewRef[i].context.$implicit.disabled = false;
            }
        }
    }
}
