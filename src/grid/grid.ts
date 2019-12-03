import {
    ViewContainerRef,
    Directive,
    ElementRef,
    EmbeddedViewRef,
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    AfterContentChecked,
    OnDestroy,
    IterableDiffer,
    Input,
    ContentChildren,
    IterableDiffers,
    ChangeDetectorRef,
    OnInit,
    ViewChild,
    IterableChangeRecord,
    TemplateRef,
    QueryList,
    TrackByFunction,
    isDevMode,
    HostBinding,
    Renderer2,
    Output,
    EventEmitter
} from '@angular/core';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { Subject, Subscription, Observable, BehaviorSubject, of as observableOf } from 'rxjs';

// import {
//     getTableUnknownDataSourceError,
//     getTableUnknownColumnError,
//     getTableMultipleDefaultRowDefsError,
//     getTableDuplicateColumnNameError
// } from '@app/shared/grid/table-errors';
import { takeUntil } from 'rxjs/operators';
import {
    SlkCellOutletRowContext,
    SlkRowDefDirective,
    SlkHeaderRowDefDirective,
    SlkFooterRowDefDirective,
    BaseRowDef,
    SlkCellOutletDirective
} from './row';
import {
    SlkColumnDefDirective
} from './cell';

/** Interface used to provide an outlet for rows to be inserted into. */
export interface RowOutlet {
    viewContainer: ViewContainerRef;
}

/** Provides a handle for the table to grab the view container's ng-container to insert data rows. */
@Directive({
    selector: '[slkRowOutlet]'
})
export class DataRowOutletDirective implements RowOutlet {
    constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) { }
}

/** Provides a handle for the table to grab the view container's ng-container to insert the header */
@Directive({
    selector: '[slkHeaderRowOutlet]'
})
export class HeaderRowOutletDirective implements RowOutlet {
    constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) { }
}

/** Provides a handle for the table to grab view container's ng-container to insert the footer. */
@Directive({
    selector: '[slkFooterRowOutlet]'
})
export class FooterRowOutletDirective implements RowOutlet {
    constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) { }
}

/**
 * The table template that can be used by slk-table
 */
export const SLK_TABLE_TEMPLATE = `
    <ng-container slkHeaderRowOutlet></ng-container>
    <ng-container slkRowOutlet></ng-container>
    <ng-container slkFooterRowOutlet></ng-container>
`;

/**
 * Class used to conveniently type the embedded view ref for rows with a context
 */
abstract class RowViewRef<T> extends EmbeddedViewRef<SlkCellOutletRowContext<T>> { }

/**
 * Set of properties that represents the identity of a single rendered row.
 */
export interface RenderRow<T> {
    data: T;
    dataIndex: number;
    rowDef: SlkRowDefDirective<T>;
}

/**
 * A data table that can render a header row, data rows and a footer row.
 */
@Component({
    selector: 'slk-table, table[slk-table]',
    exportAs: 'slkTable',
    template: SLK_TABLE_TEMPLATE,
    styleUrls: ['grid.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlkTableComponent<T> implements AfterContentChecked, CollectionViewer, OnDestroy, OnInit {
    /** Latest data provided by the data source. */
    protected _data: T[];
    public copyOfData: T[];

    /** Subject that emits when the component has been destoryed. */
    private _onDestroy = new Subject<void>();

    /** List of the rendered rows as identified by their `RenderRow` object. */
    private _renderRows: RenderRow<T>[];

    /** Subscription that listens for the data provided by the data source. */
    private _renderChangeSubscription: Subscription | null;

    /**
     * Map of all the user's defined columns (header, data, and footer cell template) identified by
     * name. Collection populated by the column definitions gathered by `ContentChildren` as well as
     * any custom column definitions added to `_customColumnDefs`.
     */
    private _columnDefsByName = new Map<string, SlkColumnDefDirective>();

    /**
     * Set of all row definitions that can be used by this table. Populated by the rows gathered by
     * using `ContentChildren` as well as any custom row definitions added to `_customRowDefs`.
     */
    private _rowDefs: SlkRowDefDirective<T>[];

    /**
     * Set of all header row definitions that can be used by this table. Populated by the rows
     * gathered by using 'ContentChildren' as well as any custom row defintions added to
     * '_customHeaderRowDefs'.
     */
    private _headerRowDefs: SlkHeaderRowDefDirective[];

    /**
     * Set of all footer row definitions that can be used by this table. Populated by the rows
     * gathered by using 'ContentChildren' as well as any custom row defintions added to
     * '_customFooterRowDefs'.
     */
    private _footerRowDefs: SlkFooterRowDefDirective[];

    /** _Differ used to find the changes in the data provided by the data source. */
    private _dataDiffer: IterableDiffer<RenderRow<T>>;

    /** Stores the row definition that does not have a when predicate. */
    private _defaultRowDef: SlkRowDefDirective<T> | null;

    /**
     * Column definitions that were defined outside of the direct content children of the table.
     * These will be defined when, e.g., creating a wrapper around the cdkTable that has
     * column definitions as *it's* content child.
     */
    private _customColumnDefs = new Set<SlkColumnDefDirective>();

    /**
     * Data row definitions that were defined outside of the direct content children of the table.
     * These will be defined when, e.g., creating a wrapper around the cdkTable that has
     * built-in data rows as *it's* content child.
     */
    private _customRowDefs = new Set<SlkRowDefDirective<T>>();

    /**
     * Header row definitions that were defined outside of the direct content children of the table.
     * These will be defined when, e.g., creating a wrapper around the cdkTable that has
     * built-in header rows as *it's* content child.
     */
    private _customHeaderRowDefs = new Set<SlkHeaderRowDefDirective>();

    /**
     * Footer row definitions that were defined outside of the direct content children of the table.
     * These will be defined when, e.g., creating a wrapper around the cdkTable that has a
     * built-in footer row as *it's* content child.
     */
    private _customFooterRowDefs = new Set<SlkFooterRowDefDirective>();

    // TODO:- Later connect it with dataSource. After filter is implmented.
    /** Page Index. */
    pageIndex = 1;
    /** Emits an event when scroll has reached the bottom. */
    @Output('scrollToBottom') scrollToBottom: EventEmitter<any> = new EventEmitter<any>();
    /** Gets the total number of rows that has to be displayed. */
    @Input()
    get length(): number { return this._length; }
    set length(value: number) {
        this._length = value;
    }
    private _length: number;

    /**
     * Tracking function that will be used to check the differences in data changes. Used similarly
     * to `ngFor` `trackBy` function. Optimize row operations by identifying a row based on its data
     * relative to the function to know if a row should be added/removed/moved.
     * Accepts a function that takes two parameters, `index` and `item`.
     */
    @Input()
    get trackBy(): TrackByFunction<T> { return this._trackByFn; }
    set trackBy(fn: TrackByFunction<T>) {
        if (isDevMode() &&
            fn != null && typeof fn !== 'function' &&
            <any>console && <any>console.warn) {
            console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.`);
        }
        this._trackByFn = fn;
    }
    private _trackByFn: TrackByFunction<T>;

    /**
     * The table's source of data, which can be provided in three ways (in order of complexity):
     *   - Simple data array (each object represents one table row)
     *   - Stream that emits a data array each time the array changes
     *   - `DataSource` object that implements the connect/disconnect interface.
     *
     */
    @Input()
    get dataSource(): DataSource<T> | Observable<T[]> | T[] { return this._dataSource; }
    set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    private _dataSource: DataSource<T> | Observable<T[]> | T[] | T[];

    /**
     * Stream containing the latest information on what rows are being displayed on screen.
     * Can be used by the data source to as heuristic of what data should be provided.
     */
    viewChange: BehaviorSubject<{ start: number, end: number }> =
        new BehaviorSubject<{ start: number, end: number }>({ start: 0, end: Number.MAX_VALUE });

    // Outlets in the table's template where the header, data rows, and footer will be inserted.
    @ViewChild(DataRowOutletDirective) _rowOutlet: DataRowOutletDirective;
    @ViewChild(HeaderRowOutletDirective) _headerRowOutlet: HeaderRowOutletDirective;
    @ViewChild(FooterRowOutletDirective) _footerRowOutlet: FooterRowOutletDirective;

    /**
     * The column definitions provided by the user that contain what the header, data, and footer
     * cells should render for each column.
     */
    @ContentChildren(SlkColumnDefDirective) _contentColumnDefs: QueryList<SlkColumnDefDirective>;

    /** Set of data row definitions that were provided to the table as content children. */
    @ContentChildren(SlkRowDefDirective) _contentRowDefs: QueryList<SlkRowDefDirective<T>>;

    /** Set of header row definitions that were provided to the table as content children. */
    @ContentChildren(SlkHeaderRowDefDirective) _contentHeaderRowDefs: QueryList<SlkHeaderRowDefDirective>;

    /** Set of footer row definitions that were provided to the table as content children. */
    @ContentChildren(SlkFooterRowDefDirective) _contentFooterRowDefs: QueryList<SlkFooterRowDefDirective>;

    /** Set class for the host element */
    @HostBinding('class') class = 'table-slk-grid';

    constructor(
        protected readonly _differs: IterableDiffers,
        protected readonly _changeDetectorRef: ChangeDetectorRef,
        protected readonly _elementRef: ElementRef,
        private renderer: Renderer2
    ) {
        // this.renderer.setStyle(_elementRef.nativeElement, 'overflow', 'auto');
    }

    ngOnInit() {
        if (this._elementRef.nativeElement.nodeName === 'TABLE') {
            this._applyNativeTableSections();
        }
        // Set up the trackBy function so that it uses the `RenderRow` as its identity by default. If
        // the user has provided a custom trackBy, return the result of that function as evaluated
        // with the values of the `RenderRow`'s data and index.
        this._dataDiffer = this._differs.find([]).create((_i: number, dataRow: RenderRow<T>) => {
            // console.log('_i', _i, dataRow);
            return this.trackBy ? this.trackBy(dataRow.dataIndex, dataRow.data) : dataRow;
        });
        // console.log('data differ', this._dataDiffer);
    }

    ngAfterContentChecked() {
        // Cache the row and column definitions gathered by ContentChildren and programmatic injection.
        this._cacheRowDefs();
        this._cacheColumnDefs();
        // Render updates if the list of columns have been changed for the header, row, or footer defs.
        this._renderUpdatedColumns();

        if (this.dataSource && this._rowDefs.length > 0 && !this._renderChangeSubscription) {
            this._observeRenderChanges();
        }

        // add a class to give styling to the host element
        this.renderer.addClass(this._elementRef.nativeElement, 'slk-grid');
    }

    ngOnDestroy() {
        this._rowOutlet.viewContainer.clear();
        this._headerRowOutlet.viewContainer.clear();
        this._footerRowOutlet.viewContainer.clear();

        // this._cachedRenderRowsMap.clear();

        this._onDestroy.next();
        this._onDestroy.complete();

        if (this.dataSource instanceof DataSource) {
            this.dataSource.disconnect(this);
        }
    }

    /**
     * Render rows based on the table's latest set of data which was either provided directly as an
     * input or retrieved through an Observable stream (directly or from a DataSource).
     * Checks for differences in the data since the last diff to perform only the necessary changes
     */
    renderRows() {
        this._renderRows = this._getAllRenderRows();
        // console.log('renderRows', this._renderRows);
        // console.log('this._dataDiffer', this._dataDiffer);
        const changes = this._dataDiffer.diff(this._renderRows);
        // console.log('changes', changes);
        if (!changes) { return; }

        const viewContainer = this._rowOutlet.viewContainer;
        changes.forEachOperation(
            (record: IterableChangeRecord<RenderRow<T>>, prevIndex: number, currentIndex: number) => {
                // console.log('record', record, prevIndex, currentIndex);
                if (record.previousIndex === null) {
                    this._insertRow(record.item, currentIndex);
                } else if (currentIndex === null) {
                    viewContainer.remove(prevIndex);
                } else {
                    const view = <RowViewRef<T>>viewContainer.get(prevIndex);
                    viewContainer.move(view, currentIndex);
                }
                if (currentIndex === this._data.length - 1) {
                    this._addScrollEvent();
                }
            });
    }

    private _getAllRenderRows(): RenderRow<T>[] {
        const renderRows: RenderRow<T>[] = [];
        // console.log('this_Data', this._data);

        // for each data object, get the list of rows that should be rendered, represented by the
        // respective 'RenderRow' object which is the pair of data and slkrowDef
        for (let i = 0; i < this._data.length; i++) {
            // console.log('this._data i', i);
            const data = this._data[i];
            const renderRowsForData = this._getRenderRowsForData(data, i);
            // console.log('render rows for data', renderRowsForData);

            for (let j = 0; j < renderRowsForData.length; j++) {
                const renderRow = renderRowsForData[j];
                // console.log('j', j, renderRow);
                renderRows.push(renderRow);
            }
        }
        return renderRows;
    }

    /**
     * Gets a list of 'RenderRow<T>' for the provided data object and any 'CdkRowDef' objects that
     * should be rendered for this data. Reuses the cached RenderRow objecst if they match the same
     * (T, SlkRowDef) pair.
     */
    private _getRenderRowsForData(
        data: T, dataIndex: number
    ): RenderRow<T>[] {
        const rowDefs = this._getRowDefs(data, dataIndex);

        return rowDefs.map((rowDef: any) => {
            return { data, rowDef, dataIndex };
        });
    }

    /** Update the map containing the content's column definitions. */
    private _cacheColumnDefs() {
        this._columnDefsByName.clear();
        const columnDefs = mergeQueryListAndSet(this._contentColumnDefs, this._customColumnDefs);

        columnDefs.forEach(columnDef => {
            // if (this._columnDefsByName.has(columnDef.name)) {
            //     throw getTableDuplicateColumnNameError(columnDef.name);
            // }
            this._columnDefsByName.set(columnDef.name, columnDef);
        });
    }

    /** Update the list of all available row definitions that can be used. */
    private _cacheRowDefs() {
        this._headerRowDefs =
            mergeQueryListAndSet(this._contentHeaderRowDefs, this._customHeaderRowDefs);
        this._footerRowDefs =
            mergeQueryListAndSet(this._contentFooterRowDefs, this._customFooterRowDefs);
        this._rowDefs =
            mergeQueryListAndSet(this._contentRowDefs, this._customRowDefs);
        // After all row definitions are determined, find the row definition to be considered default.
        const defaultRowDefs = this._rowDefs.filter(def => !def.when);
        // if (defaultRowDefs.length > 1) {
        //     throw getTableMultipleDefaultRowDefsError();
        // }
        this._defaultRowDef = defaultRowDefs[0];
    }

    /**
     * Check if the header, data, or footer rows have changed what columns they want to display or
     * whether the sticky states have changed for the header or footer. If there is a diff, then
     * re-render that section.
     */
    private _renderUpdatedColumns() {
        const columnsDiffReducer = (acc: boolean, def: BaseRowDef) => acc || !!def.getColumnsDiff();

        // console.log('this.-rowDefs', this._rowDefs);
        // Force re-render data rows if the list of column definitions have changed.
        if (this._rowDefs.reduce(columnsDiffReducer, false)) {
            this._forceRenderDataRows();
        }

        // Force re-render header/footer rows if the list of column definitions have changed..
        if (this._headerRowDefs.reduce(columnsDiffReducer, false)) {
            this._forceRenderHeaderRows();
        }

        if (this._footerRowDefs.reduce(columnsDiffReducer, false)) {
            this._forceRenderFooterRows();
        }
    }

    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the row outlet. Otherwise start listening for new data.
     */
    private _switchDataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
        this._data = [];

        if (this.dataSource instanceof DataSource) {
            this.dataSource.disconnect(this);
        }

        // Stop listening for data from the previous data source.
        if (this._renderChangeSubscription) {
            this._renderChangeSubscription.unsubscribe();
            this._renderChangeSubscription = null;
        }

        if (!dataSource) {
            if (this._dataDiffer) {
                this._dataDiffer.diff([]);
            }
            this._rowOutlet.viewContainer.clear();
        }

        this._dataSource = dataSource;
    }

    /** Sets up a subscription for the data provided by the data source. */
    private _observeRenderChanges() {
        // If no data source has been set, there is nothing to observe for changes.
        if (!this.dataSource) { return; }

        let dataStream: Observable<T[]> | undefined;
        // Check if the datasource is a DataSource object by observing if it has a connect function.
        // Cannot check this.dataSource['connect'] due to potential property renaming, nor can it
        // checked as an instanceof DataSource<T> since the table should allow for data sources
        // that did not explicitly extend DataSource<T>.
        if ((this.dataSource as DataSource<T>).connect instanceof Function) {
            dataStream = (this.dataSource as DataSource<T>).connect(this);
            // console.log('dataSteam', dataStream);
        } else if (this.dataSource instanceof Observable) {
            dataStream = this.dataSource;
            // console.log('dataStream1', dataStream);
        } else if (Array.isArray(this.dataSource)) {
            dataStream = observableOf(this.dataSource);
            // console.log('dataStream2', dataStream);
        }

        // if (dataStream === undefined) {
        //     throw getTableUnknownDataSourceError();
        // }

        this._renderChangeSubscription = dataStream
            .pipe(takeUntil(this._onDestroy))
            .subscribe((data: any) => {
                this._data = data || [];
                this.copyOfData = this._data.slice();
                this.renderRows();
            });
    }

    /**
     * Clears any existing content in the header row outlet and creates a new embedded view
     * in the outlet using the header row definition.
     */
    private _forceRenderHeaderRows() {
        // Clear the header row outlet if any content exists.
        if (this._headerRowOutlet.viewContainer.length > 0) {
            this._headerRowOutlet.viewContainer.clear();
        }

        this._headerRowDefs.forEach((def, i) => this._renderRow(this._headerRowOutlet, def, i));
    }
    /**
     * Clears any existing content in the footer row outlet and creates a new embedded view
     * in the outlet using the footer row definition.
     */
    private _forceRenderFooterRows() {
        // Clear the footer row outlet if any content exists.
        if (this._footerRowOutlet.viewContainer.length > 0) {
            this._footerRowOutlet.viewContainer.clear();
        }

        this._footerRowDefs.forEach((def, i) => this._renderRow(this._footerRowOutlet, def, i));
    }

    /**
     * Get the matching row definitions that should be used for this row data. If there is only
     * one row defintion, it is returned. otherwise, find the row definitions that has a when
     * predicate that returns true with the data. If none reutrn true, retun thedefault row
     * definition
     */
    _getRowDefs(data: T, dataIndex: number): SlkRowDefDirective<T>[] {
        if (this._rowDefs.length === 1) { return [this._rowDefs[0]]; }

        const rowDefs: SlkRowDefDirective<T>[] = [];

        const rowDef =
            this._rowDefs.find(def => def.when && def.when(dataIndex, data)) || this._defaultRowDef;
        if (rowDef) {
            rowDefs.push(rowDef);
        }

        return rowDefs;
    }

    /**
     * Create the embedded view for the data row template and place it in the correct index location
     * within the data row view container.
     */
    private _insertRow(renderRow: RenderRow<T>, renderIndex: number) {
        // console.log('render row', renderRow);
        const rowDef = renderRow.rowDef;
        const context: SlkCellOutletRowContext<T> = { $implicit: renderRow.data };
        // console.log('context', context);
        this._renderRow(this._rowOutlet, rowDef, renderIndex, context);
    }

    /**
     * Creates a new row template in the outlet and fills it with the set of cell templates.
     * Optionally takes a context to provide to the row and cells, as well as an optional index
     * of where to place the new row template in the outlet
     */
    private _renderRow(
        outlet: RowOutlet, rowDef: BaseRowDef, index: number, context: SlkCellOutletRowContext<T> = {}
    ) {
        // console.log('outlet', outlet, rowDef, index, context);
        outlet.viewContainer.createEmbeddedView(rowDef.template, context, index);

        for (let _a = 0, _b = this._getCellTemplates(rowDef); _a < _b.length; _a++) {
            const cellTemplate = _b[_a];
            // console.log('cell template', SlkCellOutletDirective.mostRecentCellOutlet, cellTemplate);
            if (SlkCellOutletDirective.mostRecentCellOutlet) {
                // console.log('create embedded view');
                SlkCellOutletDirective.mostRecentCellOutlet._viewContainer.createEmbeddedView(cellTemplate, context);
            }
        }

        this._changeDetectorRef.markForCheck();
    }

    /** Gets the column definitions for the provided row def. */
    private _getCellTemplates(rowDef: BaseRowDef): TemplateRef<any>[] {
        // console.log('row def', rowDef);
        if (!rowDef || !rowDef.columns) { return []; }
        // console.log('!rowdef pass', rowDef.columns);
        return Array.from(rowDef.columns, columnId => {
            // console.log('columnId', columnId, this._columnDefsByName);
            const column = this._columnDefsByName.get(columnId);
            // console.log('column', column);

            // if (!column) {
            //     throw getTableUnknownColumnError(columnId);
            // }

            return rowDef.extractCellTemplate(column);
        });
    }

    /**
     * Adds native table sections (e.g tbody) and moves the router outlets into them.
     */
    _applyNativeTableSections() {
        const sections = [
            { tag: 'thead', outlet: this._headerRowOutlet },
            { tag: 'tbody', outlet: this._rowOutlet },
            { tag: 'tfoot', outlet: this._footerRowOutlet }
        ];
        for (let _a = 0, sections_1 = sections; _a < sections_1.length; _a++) {
            const section = sections_1[_a];
            const element = document.createElement(section.tag);
            element.appendChild(section.outlet.elementRef.nativeElement);
            this._elementRef.nativeElement.appendChild(element);
        }
    }
    /**
     * TODO: Move this to a new scroll module later.
     * Adds a scroll event on the grid.
     */
    _addScrollEvent(): void {
        const tbody = document.getElementsByTagName('tbody');
        tbody[0].addEventListener('scroll', (event: UIEvent) => {
            // Avoids scroll event to get fired twice.
            event.stopImmediatePropagation();
            this.onScroll(event);
        });
    }
    // Later change the logic.
    onScroll(event: any): void {
        const tbodyViewHeight = event.target.offsetHeight;
        const tbodyScrollHeight = event.target.scrollHeight;
        const scrollLocation = event.target.scrollTop;
        // If the user has scrolled to the bottom, send signal via output binding.
        const limit = tbodyScrollHeight - tbodyViewHeight;

        // get total pages.
        const totalPages = this.length / this._data.length;

        if (scrollLocation === limit) {
            this.pageIndex++;
            if (totalPages >= this.pageIndex) {
                this.scrollToBottom.emit({
                    pageIndex: this.pageIndex,
                    totalRows: this._length
                });
            } else {
                return;
            }
        }
    }

    /**
     * Forces a re-render of the data rows. Should be called in cases where there has been an input
     * change that affects the evaluation of which should be rendered adding/removing row definitions
     */
    private _forceRenderDataRows() {
        this._dataDiffer.diff([]);
        this._rowOutlet.viewContainer.clear();
        this.renderRows();
    }
}

/** Utility function that gets a merged list of the entries in a QueryList and values of a Set. */
function mergeQueryListAndSet<T>(queryList: QueryList<T>, set: Set<T>): T[] {
    // console.log('query list', queryList, set);
    return queryList.toArray().concat(Array.from(set));
}


