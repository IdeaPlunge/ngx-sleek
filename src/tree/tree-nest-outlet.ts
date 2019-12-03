import {
    Directive,
    ViewContainerRef,
    Input,
    ElementRef,
    Renderer2,
    HostListener
} from '@angular/core';

@Directive({ selector: '[slkTreeTextOutlet]' })
export class SlkTreeTextOutletDirective<T> {
    static mostRecentTreeTextOutlet: SlkTreeTextOutletDirective<{}> | null = null;

    get data(): T { return this._data; }
    set data(value: T) {
        this._data = value;
    }
    protected _data: T;

    get context(): any { return this._context; }
    set context(value: any) {
        this._context = value;
    }
    protected _context: any;

    constructor() {
        SlkTreeTextOutletDirective.mostRecentTreeTextOutlet = this as SlkTreeTextOutletDirective<T>;
    }
}


@Directive({
    selector: '[slkAction]',
    // exportAs: 'slkAction'
})
export class SlkTreeActionDirective {
    @Input() on: boolean;
    constructor(
        public viewContainer: ViewContainerRef,
        public elementRef: ElementRef,
        public renderer: Renderer2
    ) {
        renderer.setStyle(elementRef.nativeElement, 'backgroundColor', '#e2e0e0');
    }

    @HostListener('mouseover') onMouseOver() {
        const el = this.elementRef.nativeElement.querySelector('.actions');
        this.renderer.setStyle(el, 'visibility', 'visible');
    }
    @HostListener('mouseout') onMouseOut() {
        const el = this.elementRef.nativeElement.querySelector('.actions');
        this.renderer.setStyle(el, 'visibility', 'hidden');
    }
}

