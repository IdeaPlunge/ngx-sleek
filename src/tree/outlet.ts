import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[slkTreeNodeOutlet]'
})
export class SlkTreeNodeOutletDirective {
    constructor(public viewContainer: ViewContainerRef) { }
}
