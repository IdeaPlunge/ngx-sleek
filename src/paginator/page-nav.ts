import {
    Directive,
    ViewContainerRef,
    TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[slkNavigator]'
})
export class SlkNavDirective {
    constructor(public viewContainer: ViewContainerRef) { }
}

@Directive({
    selector: '[slkPageIndex]'
})
export class SlkPageIndexDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}
