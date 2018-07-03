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
import { map } from 'rxjs/operators';
import * as methods from './grid-methods';

export class SlkGridDataSource<T> extends DataSource<T> {
    /** Stream that emits when a new data array is set on the data source. */
    private readonly _data: BehaviorSubject<T[]>;
    /** Stream emitting render data to the table (depends on ordered data changes). */
    private readonly _renderData = new BehaviorSubject<T[]>([]);
    /**
     * Subscription to the changes that should trigger an update to table's rendered row, such
     * as sorting, pagination or base data changes.
     */
    _renderChangesSubscription = Subscription.EMPTY;

    /** Array of data that should be rendered by the table */
    get data() { return this._data.value; }
    set data(data: T[]) { this._data.next(data); }

    /**
     * Instance of the SlkSortDirective used by the table to control its sort
     */
    get sort(): SlkSortDirective | null { return this._sort; }
    set sort(sort: SlkSortDirective | null) {
        // console.log('_sort test', sort);
        this._sort = sort;
        this._updateChangeSubscription();
    }
    private _sort: SlkSortDirective | null;

    /**
     * Gets a sorted copy of the data array based on the state of the SlkSortDirective.
     */
    sortData: (
        (data: T[], sort: SlkSortDirective, initial: boolean) => T[]
    ) = (data: T[], sort: SlkSortDirective, initial: boolean): T[] => {
        // console.log('data from sort data function', data);
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
    /** Subscribe to changes that should trigger an update to the table's rendered rows. */
    _updateChangeSubscription() {
        const sortChange: Observable<Sort | null> = this._sort ?
            merge<Sort>(this._sort.slkSortChange, this._sort.initialised) :
            observableOf(null);
        // sortChange.subscribe(t => { console.log('t', t); });
        const dataStream = this._data;
        // Watch for sort changes to provide ordered data
        const orderedData = combineLatest(dataStream, sortChange)
            .pipe(map(([data]) => this._orderData(data)));

        this._renderChangesSubscription.unsubscribe();
        this._renderChangesSubscription = orderedData.subscribe(data => this._renderData.next(data));
    }

    /**
     * Returns a sorted copy of the data if SlkSortDirective has a sort applied, otherwise just returns the
     * data array as provided.
     */
    _orderData(data: T[]): T[] {
        // console.log('order data', this.sort);
        // If there is no active sort or direction then return data.
        if (!this.sort) { return data; }
        return this.sortData(data.slice(), this.sort, false);
    }

    /** Used by the SlkTable. Called when it connects to the data source. */
    connect() { return this._renderData; }
    /** Used by SlkTable, Called when it is destroyed. */
    disconnect() { }

}
