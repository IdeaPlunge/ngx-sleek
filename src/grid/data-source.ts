import { DataSource } from '@angular/cdk/table';
import {
    BehaviorSubject,
    Subscription,
    Observable,
    of as observableOf,
    merge,
    combineLatest
} from 'rxjs';
import { SlkSortDirective, Sort } from '../sort/sort';
import { map, take } from 'rxjs/operators';
import * as methods from './grid-methods';
import { PageEvent, SlkPaginatorComponent } from '../paginator';
import { SlkGridFilterDirective } from '../grid-filter';
import { SlkRowSelectDirective } from '../row-select/row-select.directive';

export class SlkGridDataSource<T> extends DataSource<T> {
    /** Stream that emits when a new data array is set on the data source. */
    private readonly _data: BehaviorSubject<any[]>;
    /** Stream emitting render data to the table (depends on ordered data changes). */
    private readonly _renderData = new BehaviorSubject<T[]>([]);
    /**
     * Subscription to the changes that should trigger an update to table's rendered row, such
     * as sorting, pagination or base data changes.
     */
    _renderChangesSubscription = Subscription.EMPTY;

    /** Array of data that should be rendered by the table */
    get data() { return this._data.value; }
    set data(data: any[]) { this._data.next(data); }

    /**
     * Instance of the SlkSortDirective used by the table to control its sort
     */
    get sort(): SlkSortDirective | null { return this._sort; }
    set sort(sort: SlkSortDirective | null) {
        this._sort = sort;
        this._updateChangeSubscription();
    }
    private _sort: SlkSortDirective | null;

    get paginator(): SlkPaginatorComponent | null { return this._paginator; }
    set paginator(paginator: SlkPaginatorComponent | null) {
        // console.log('paginator', paginator);
        this._paginator = paginator;
        this._updateChangeSubscription();
    }
    private _paginator: SlkPaginatorComponent | null;

    get filter(): SlkGridFilterDirective | null { return this._filter; }
    set filter(filter: SlkGridFilterDirective | null) {
        this._filter = filter;
        this._updateChangeSubscription();
    }
    private _filter: SlkGridFilterDirective | null;

    get select(): SlkRowSelectDirective | null { return this._select; }
    set select(select: SlkRowSelectDirective | null) {
        this._select = select;
        this._updateDataSource();
    }
    private _select: SlkRowSelectDirective | null;

    /**
     * Gets a sorted copy of the data array based on the state of the SlkSortDirective.
     */
    sortData: (
        (data: T[], sort: SlkSortDirective, initial: boolean) => T[]
    ) = (data: T[], sort: SlkSortDirective, initial: boolean): T[] => {
        const active = sort.active;
        const direction = sort.direction;

        if (direction === '') { return data; }
        if (initial) {
            methods.quickSort(data, active, 0, data.length - 1);
            data = methods._finalDataSet;
            return data;
        }

        switch (direction) {
            case 'asc':
                return methods.shellSortAsc(data, active);
            case 'desc':
                return methods.shellSortDesc(data, active);
            default: return data;
        }
    }

    constructor(initialData: T[] = []) {
        super();
        this._data = new BehaviorSubject<T[]>(initialData);
        this._updateChangeSubscription();
    }
    _updateDataSource() {
        this._data
            .pipe(take(2))
            .subscribe((data) => {
                if (data.length) {
                    const editedData = data.map((prop) => {
                        return {
                            ...prop,
                            Row_Select: ''
                        };
                    });
                    this._data.next(editedData);
                }
            });
    }
    /** Subscribe to changes that should trigger an update to the table's rendered rows. */
    _updateChangeSubscription() {
        const sortChange: Observable<Sort | null> = this._sort ?
            merge<Sort>(this._sort.slkSortChange, this._sort.initialised) :
            observableOf(null);
        const pageChange: Observable<PageEvent | null> = this._paginator ?
            merge<PageEvent>(this._paginator.page, this._paginator.initialised) :
            observableOf(null);
        const filterChange: Observable<any | null> = this._filter ?
            merge<any>(this._filter.slkFilterChange, this._filter.initialised) :
            observableOf(null);


        const dataStream = this._data;
        // Watch for sort changes to provide ordered data
        const orderedData = combineLatest(dataStream, sortChange)
            .pipe(map(([data]) => this._orderData(data)));
        const paginatedData = combineLatest(orderedData, pageChange)
            .pipe(map(([data]) => this._pageData(data)));
        const filteredData = combineLatest(paginatedData, filterChange)
            .pipe(map(([data]) => this._filterData(data)));

        this._renderChangesSubscription.unsubscribe();
        this._renderChangesSubscription = filteredData.subscribe(data => this._renderData.next(data));
    }

    /**
     * Returns a sorted copy of the data if SlkSortDirective has a sort applied, otherwise just returns the
     * data array as provided.
     */
    _orderData(data: T[]): T[] {
        // If there is no active sort or direction then return data.
        if (!this.sort) { return data; }
        return this.sortData(data.slice(), this.sort, false);
    }
    /**
    * Returns a paged splice of the provided array according to the SlkPaginatorComponent's page
    * index and length;
    */
    _pageData(data: T[]): T[] {
        if (!this.paginator) { return data; }
        const startIndex = (this.paginator.pageIndex - 1) * this.paginator.pageSize;
        return data.slice().splice(startIndex, this.paginator.pageSize);
    }

    _filterData(data: T[]): T[] {
        if (!this.filter) { return data; }

        // Write following lines in separate function.
        // Takes the new filtered array.
        const filteredDataArray: any[] = [];

        if (this._filter.active) {
            console.log('1', this._filter.selectedOptions);

            const key = this._filter.key ? this._filter.key : this._filter.active;

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < this._filter.selectedOptions.length; j++) {
                    if (data[i][key] === this._filter.selectedOptions[j]) {
                        console.log('enter');
                        filteredDataArray.push(data[i]);
                    }
                }
            }
            console.log('filteredDataArray', filteredDataArray);

            return filteredDataArray;
        } else {
            return data;
        }
    }

    /** Used by the SlkTable. Called when it connects to the data source. */
    connect() { return this._renderData; }
    /** Used by SlkTable, Called when it is destroyed. */
    disconnect() { }

}
