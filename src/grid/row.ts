import {
    IterableDiffer,
    IterableDiffers,
    TemplateRef,
    SimpleChanges,
    OnChanges,
    IterableChanges,
    ViewContainerRef,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    Component,
    Directive,
    Input,
    Renderer2,
    ElementRef,
    OnInit
} from '@angular/core';
import { SlkColumnDefDirective, SlkCellDef } from './cell';
import { DirectiveService } from './directive-service';
import { take } from 'rxjs/operators';
import { RowSelectService } from '../row-select/row-select.service';

/**
 * The row template that can be used by the slk-table.
 */
export const SLK_ROW_TEMPLATE = `<ng-container slkCellOutlet></ng-container>`;

/**
 * Base class for the SlkHeaderRowDef and SlkRowDef that handles checking their columns inputs
 * for changes and notifying the table.
 */
export abstract class BaseRowDef implements OnChanges {
    /** The columns to be displayed on this row. */
    columns: Iterable<string>;

    /** Differ used to check if any changes were made to the columns. */
    protected _columnsDiffer: IterableDiffer<any>;

    constructor(
        public template: TemplateRef<any>,
        protected _differs: IterableDiffers,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log('this.columns from row', this.columns);
        // create a new columns differ if one does not yet exist. Initialize it based on initial value
        // of the columns property or an empty array if none is provided.
        if (!this._columnsDiffer) {
            const columns = (changes['columns'] && changes['columns'].currentValue) || [];
            // console.log('columns from row', columns);
            this._columnsDiffer = this._differs.find(columns).create();
            this._columnsDiffer.diff(columns);
        }
    }

    /**
     * Returns the difference between the current columns and the columns from the last diff, or ull
     * if there is no difference.
     */
    getColumnsDiff(): IterableChanges<any> | null {
        return this._columnsDiffer.diff(this.columns);
    }

    /** Gets this row def's relevant cell template from the provided column def. */
    extractCellTemplate(column: SlkColumnDefDirective): TemplateRef<any> {
        // console.log('column from row', column, this instanceof SlkHeaderRowDefDirective);
        return extractCellTemp(this, column);
    }

}

export class SlkHeaderRowDefBase extends BaseRowDef { }
// export const _SlkHeaderRowDefBase = mixinHasStickyInput(SlkHeaderRowDefBase);

/**
 * Header row definition for the slk table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
    selector: '[slkHeaderRowDef]',
})
export class SlkHeaderRowDefDirective extends SlkHeaderRowDefBase implements OnChanges, OnInit {
    @Input('slkHeaderRowDef') slkHeaderRowDef: any;
    @Input() columns: any;

    constructor(
        template: TemplateRef<any>,
        _differs: IterableDiffers,
        private directiveService: DirectiveService,
        private rowSelectService: RowSelectService
    ) {
        super(template, _differs);
        // console.log('appHeaderRowDef', this.appHeaderRowDef);
    }

    // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
    // Explicitly define it so that the method is called as part of the Angular lifecycle.
    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        // this.columns = this.slkHeaderRowDef;

        this.rowSelectService.init
            .pipe(take(1))
            .subscribe((initialised: boolean) => {
                if (initialised) {
                    this.slkHeaderRowDef.push('Row_Select');
                    this.columns = this.slkHeaderRowDef;
                } else {
                    this.columns = this.slkHeaderRowDef;
                }
            });
    }

    ngOnInit() {
        this.directiveService.setTotalColumns(this.columns);
    }
}

export class SlkFooterRowDefBase extends BaseRowDef { }

/**
 * Footer row definition for the CDK table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
@Directive({
    selector: '[slkFooterRowDef]'
})
export class SlkFooterRowDefDirective extends BaseRowDef implements OnChanges {
    constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
        super(template, _differs);
    }

    // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
    // Explicitly define it so that the method is called as part of the Angular lifecycle.
    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
    }
}

function extractCellTemp(that: any, column: any): TemplateRef<any> {
    if (that instanceof SlkHeaderRowDefDirective) {
        return column.headerCell.template;
    } if (that instanceof SlkFooterRowDefDirective) {
        return column.footerCell.template;
    } else {
        return column.cell.template;
    }
}

/**
 * Data row definition for the slk table.
 * Captures the header row's template and other row properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */

@Directive({
    selector: '[slkRowDef]'
})
export class SlkRowDefDirective<T> extends BaseRowDef implements OnChanges {
    @Input('slkRowDefColumns') slkRowDefColumns: any;
    @Input() columns: any;
    /**
     * Function that should return true if this row template should be used for the provided index
     * and row data. If left undefined, this row will be considered the default row template to use
     * when no other when functions return true for the data.
     * For every row, there must be at least one when function that passes or undedined to default.
     */
    when: (index: number, rowDatA: T) => boolean;
    constructor(template: TemplateRef<any>, _differs: IterableDiffers) {
        super(template, _differs);
        // console.log('appRowDefColumns', this.appRowDef);
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        this.columns = this.slkRowDefColumns;
        // console.log('appRowDefColumns1', this.appRowDef);
    }
}

/** Context provided to the row cells */
export interface SlkCellOutletRowContext<T> {
    /** Data for the row that this cell is located within. */
    $implicit?: T;

    /** Index of the data object in the provided data array. */
    index?: number;

    /** Length of the number of total rows. */
    count?: number;

    /** True if this cell is contained in the first row. */
    first?: boolean;

    /** True if this cell is contained in the last row. */
    last?: boolean;

    /** true if this is containeed in a row with even-numbered index. */
    even?: boolean;

    /** True if this cell is contained in a row with an odd-numbered index. */
    odd?: boolean;
}

/**
 * Outlet for rendering cells inside of a row or header row.
 */
@Directive({ selector: '[slkCellOutlet]' })
export class SlkCellOutletDirective {
    /**
     * Static property containing the latest constructed instance of this class.
     * Used by the CDK table when each CdkHeaderRow and CdkRow component is created using
     * createEmbeddedView. After one of these components are created, this property will provide
     * a handle to provide that component's cells and context. After init, the CdkCellOutlet will
     * construct the cells with the provided context.
     */
    static mostRecentCellOutlet: SlkCellOutletDirective | null = null;
    /** The ordered list of cells to render within this outlet's view container */
    cells: SlkCellDef[];

    /** the data context to be provided to each cell. */
    context: any;

    constructor(public _viewContainer: ViewContainerRef) {
        // console.log('this this', this);
        SlkCellOutletDirective.mostRecentCellOutlet = this;
    }
}

/** Header template container that container the cell outlet. */
@Component({
    selector: 'slk-header-row, tr[slk-header-row]',
    template: SLK_ROW_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['grid.scss']
})
export class SlkHeaderRowComponent {
    constructor(private renderer: Renderer2, elementRef: ElementRef) {
        this.renderer.addClass(elementRef.nativeElement, 'header-row');
    }
}

/** Footer template container that contains the cell outlet. */
@Component({
    selector: 'slk-footer-row, tr[slk-footer-row]',
    template: SLK_ROW_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['grid.scss']
})
export class SlkFooterRowComponent { }

/** Data row template container that contains cell outlet. */
@Component({
    selector: 'slk-row, tr[slk-row]',
    template: SLK_ROW_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['grid.scss']
})
export class SlkRowComponent {
    constructor(private renderer: Renderer2, elementRef: ElementRef) {
        this.renderer.addClass(elementRef.nativeElement, 'header-row');
    }
}

