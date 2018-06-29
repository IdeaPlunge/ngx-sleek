import {
    TemplateRef,
    Directive,
    Input,
    ContentChild,
    ElementRef,
} from '@angular/core';

/** Base interface for a cell definition. */
export interface SlkCellDef {
    template: TemplateRef<any>;
}

/**
 * Cell definition for a Slk Table.
 */
@Directive({ selector: '[slkCellDef]' })
export class SlkCellDefDirective implements SlkCellDef {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * Header cell defintion for a Slk table.
 */
@Directive({ selector: '[slkHeaderCellDef]' })
export class SlkHeaderCellDefDirective implements SlkCellDef {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * Footer cell defintion for a Slk table.
 */
@Directive({ selector: '[slkFooterCellDef]' })
export class SlkFooterCellDefDirective implements SlkCellDef {
    constructor(public template: TemplateRef<any>) { }
}

export class SlkColumnDefBase { }

/**
 * Column definition for the Slk table.
 */
@Directive({
    selector: '[slkColumnDef]'
})
export class SlkColumnDefDirective extends SlkColumnDefBase {
    /** Unique name for this column. */
    @Input('slkColumnDef')
    get name(): string { return this._name; }
    set name(name: string) {
        // If the directive is set without a name (updated programatically), then this setter will
        if (!name) { return; }

        this._name = name;
        this.cssClassFriendlyName = name;
    }
    _name: string;

    @ContentChild(SlkCellDefDirective) cell: SlkCellDef;
    @ContentChild(SlkHeaderCellDefDirective) headerCell: SlkHeaderCellDefDirective;
    @ContentChild(SlkFooterCellDefDirective) footerCell: SlkFooterCellDefDirective;

    /**
     * Transformed version of the column name that can be used a part of css classname.
     */
    cssClassFriendlyName: string;
}

/** Base class for the cells. Adds a CSS classname that identifies the column it renders in. */
export class BaseSlkCell {
    constructor(columnDef: SlkColumnDefDirective, elementRef: ElementRef) {
        const columnClassName = `slk-column-${columnDef.cssClassFriendlyName}`;
        elementRef.nativeElement.classList.add(columnClassName);
    }
}

/** Header cell template container. */
@Directive({
    selector: 'slkHeaderCell, th[slkHeaderCell]'
})
export class SlkHeaderCellDirective extends BaseSlkCell {

    constructor(
        columnDef: SlkColumnDefDirective,
        elementRef: ElementRef
    ) {
        super(columnDef, elementRef);
    }
}

/** Footer cell template container */
@Directive({
    selector: 'slkFooterCell, th[slkFooterCell]'
})
export class SlkFooterCellDirective extends BaseSlkCell {
    constructor(columnDef: SlkColumnDefDirective, elementRef: ElementRef) {
        super(columnDef, elementRef);
    }
}

/** Cell template container */
@Directive({
    selector: 'slkCell, td[slkCell]'
})
export class SlkCellDirective extends BaseSlkCell {
    constructor(
        columnDef: SlkColumnDefDirective,
        elementRef: ElementRef
    ) {
        super(columnDef, elementRef);
    }
}
