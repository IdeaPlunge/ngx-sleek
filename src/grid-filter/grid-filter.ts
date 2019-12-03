import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
    HostListener,
    Optional,
    Input,
    ViewContainerRef,
    ElementRef,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SlkGridFilterDirective } from './filter';
import { SlkColumnDefDirective, SlkTableComponent } from '../grid';
import { DomService } from './grid-filter-service';
import { SlkGridPopupComponent, selectedOptions } from '../grid-popup';
import { ActionsService } from '../tree/tree-service';
import { takeUntil } from 'rxjs/operators';


export const actualData = 'actual-data';
/** The max height of the filter's overlay panel */
export const FILTER_PANEL_MAX_HEIGHT = 256;

/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
export const FILTER_PANEL_VIEWPORT_PADDING = 8;

@Component({
    selector: 'slk-filter-header',
    templateUrl: 'grid-filter.html',
    styleUrls: ['grid-filter.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlkGridFilterComponent<T>
    implements
    OnInit,
    OnDestroy {
    /** When this component is initialised. */
    public initialised: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    /** Destroy. */
    public _onDestroy: Subject<any> = new Subject();
    public _popup: SlkGridPopupComponent<T>;

    private initialData: any[];

    /** Gets the metadata if provided by the user.
     * Has to Follow a format,
     * TODO:- Get the format final
     */

    @Input('metadata') public metadata: any[];
    public key: string | number;

    /** ID of the filter-header. When used with slkColumndef, will default to column's name. */
    @Input('slk-filter-header') id: string;
    @HostListener('click')
    onFilterChange(): void {
        // Get the id of the selected filter and filter all unique values.
        // Then pass the data to the popup component
        let uniqueOptions;
        if (!this.initialData) {
            uniqueOptions = this._filterUniqueValues(this.id, this._grid.copyOfData);

            this.initialData = this._grid.copyOfData.slice();
            this.cacheService.set(actualData, this.initialData);
            this.openPopup(uniqueOptions);
            return;
        } else {
            this.cacheService.get(actualData)
                .pipe(takeUntil(this._onDestroy))
                .subscribe((data: any[]) => {
                    uniqueOptions = this._filterUniqueValues(this.id, data);
                    this.openPopup(uniqueOptions);
                    return;
                });
        }
    }

    constructor(
        @Optional() public _filter: SlkGridFilterDirective,
        @Optional() public _slkColumnDef: SlkColumnDefDirective,
        public viewContainerRef: ViewContainerRef,
        private _elementRef: ElementRef,
        private domService: DomService,
        private _grid: SlkTableComponent<any>,
        protected cacheService: ActionsService
    ) { }
    ngOnInit() {
        this.initialised.next(true);
        // Sets the id for every column name
        this.id = this._slkColumnDef.name;
    }

    ngOnDestroy() {
        this.initialised.complete();

        this._onDestroy.next();
        this._onDestroy.complete();
    }

    /** Opens the popup filter. */
    private openPopup(uniqueOptions: any[]) {
        // Opens a dialog and injects data in the entryComponent.
        const overlayOptionsRef = this.domService.open(
            this._elementRef,
            { data: uniqueOptions }
        );

        // Subscribes to on close behavior
        this._filterClose();
    }

    /** Subscribes to the on closed behavior. */
    _filterClose() {
        // When the filter popup is closed.
        this.domService.onCloseBehavior
            .pipe(takeUntil(this._onDestroy))
            .subscribe((isClosed: any) => {
                if (isClosed) {
                    this._getSelectedValues();
                }
            });
    }

    /** Gets the selected values in the unique filter drop down. */
    _getSelectedValues() {
        this.cacheService.get(selectedOptions)
            .pipe(takeUntil(this._onDestroy))
            .subscribe((selectedValues: any[]) => {
                // Send the selected values to filter data in the grid.
                this._filter.filter(selectedValues, this.id, this.key);
            });
    }

    /**  Filters the unique values in the column. */
    _filterUniqueValues(columnId: string, data: T[]): T[] {
        // Stores the unique filters value in an array.
        const uniqueValuesInTheColumn: any[] = [];
        let uniqueValues: any[] = [];
        let options: any[] = [];

        if (this.metadata) {
            for (let i = 0; i < this.metadata.length; i++) {
                if (this.metadata[i].name === this.id) {
                    // has to be id or a specific format supported
                    this.key = this.metadata[i].reference_id;
                    break;
                }
            }
            for (let i = 0; i < data.length; i++) {
                uniqueValuesInTheColumn.push(data[i][this.key]);
            }
            // remove duplicates
            uniqueValues = this._removeDuplicates(uniqueValuesInTheColumn);
            options = this._options(uniqueValues);
            return options;

        } else {

            for (let i = 0; i < data.length; i++) {
                uniqueValuesInTheColumn.push(data[i][columnId]);
            }
            uniqueValues = this._removeDuplicates(uniqueValuesInTheColumn);
            options = this._options(uniqueValues);
            return options;
        }


    }
    /** Removes duplicates. */
    _removeDuplicates(uniqueValuesInTheColumn: any[]): any[] {
        return uniqueValuesInTheColumn.filter((element, pos) => {
            return uniqueValuesInTheColumn.indexOf(element) === pos;
        });
    }

    _options(uniqueValues: any[]) {
        return uniqueValues.map((eachEl: any, index: number) => {
            return {
                name: eachEl,
                checked: false
            };
        });
    }

}

