import {
    Directive,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';

export class SlkTreeNodeOutletContext<T> {
    /** Data for the node. */
    $implicit: T;
    /** Depth of the node. */
    level: number;
    /** Index location of node. */
    index?: number;
    /** Length of the number of total dataNodes */
    count?: number;

    constructor(data: T) {
        this.$implicit = data;
    }
}

/**
 * Data node defintion for the SlkTreeComponent.
 * Captures the node's template
 */
@Directive({
    selector: '[slkTreeNodeDef]',
    inputs: [
        'when: slkTreeNodeDefWhen'
    ]
})
export class SlkTreeNodeDefDirective<T> {

    when: (index: number, nodeData: T) => boolean;

    constructor(
        public template: TemplateRef<any>,
        public viewContainer: ViewContainerRef
    ) { }
}

