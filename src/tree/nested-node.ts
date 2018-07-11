import {
    Directive,
    AfterContentInit,
    OnDestroy,
    IterableDiffer,
    ContentChildren,
    ElementRef,
    IterableDiffers,
    QueryList,
    Renderer2,
    EventEmitter,
    ViewContainerRef,
    OnInit,
    HostListener,
    Optional,
    EmbeddedViewRef,
} from '@angular/core';
import {
    SlkTreeComponent
} from './tree';

import { takeUntil } from 'rxjs/operators';
import { SlkTreeNodeOutletDirective } from './outlet';
import { ActionsService, viewRefKey, viewRefContainer } from './tree-service';
import { Observable } from 'rxjs';
import { SlkTreeNodeDirective } from './node-directive';

@Directive({
    selector: 'slk-nested-tree-node',
    exportAs: 'slkNestedTreeNode',
    providers: [
        { provide: SlkTreeNodeDirective, useExisting: SlkNestedTreeNodeDirective },
    ]
})
export class SlkNestedTreeNodeDirective<T>
    extends SlkTreeNodeDirective<T>
    implements OnInit, AfterContentInit, AfterContentInit, OnDestroy {
    /** Differ used to find the changes in the data provided by the data source. */
    private _dataDiffer: IterableDiffer<T>;
    /** The children data dataNodes of current node. they will be placed in SlkTreeNodeOutletDirective */
    protected _children: T[];

    public addEvent: EventEmitter<any>;

    public cachedData: Observable<any>;

    /** Embedded view ref to be dropped in the container. */
    _droppedViewRef: EmbeddedViewRef<any>;

    /** The children node placeholder. */
    @ContentChildren(SlkTreeNodeOutletDirective) nodeOutlet: QueryList<SlkTreeNodeOutletDirective>;

    @HostListener('drop', ['$event'])
    public drop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        /** after drop event is fired get a reference of parent view container ref and its data */
        const nodeContext = JSON.parse(event.dataTransfer.getData('nodeContext'));

        /** Embeds the view when dropped to the dropped view container ref. */
        this._embedView(nodeContext, this._viewContainer.injector);

        /** Removes the dragged view ref from view container ref */
        // this._removeView();
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    constructor(
        protected _elementRef: ElementRef,
        protected _tree: SlkTreeComponent<T>,
        protected _differs: IterableDiffers,
        public _viewContainer: ViewContainerRef,
        private renderer: Renderer2,
        @Optional() private actionService: ActionsService
    ) {
        super(_elementRef, _tree);
    }

    ngOnInit() {
        this.renderer.setStyle(this._elementRef.nativeElement, 'display', 'block');
        this.renderer.setStyle(this._elementRef.nativeElement, 'padding-left', '40px');
    }

    ngAfterContentInit() {
        this._dataDiffer = this._differs.find([]).create(this._tree.trackBy);
        // data coming from the parent class as mostRecentDataNode
        this._tree.treeControl.getChildren(this.data)
            .pipe(takeUntil(this._destroyed))
            .subscribe((result: any) => {
                // console.log('result', result);
                this._children = result;
                this.updateChildrenNodes();
            });
        this.nodeOutlet.changes.pipe(takeUntil(this._destroyed))
            .subscribe((_) => this.updateChildrenNodes());
    }

    ngOnDestroy() {
        this._clear();
        super.ngOnDestroy();
    }
    /** Add children dataNodes to the NodeOutlet */
    protected updateChildrenNodes(): void {

        if (this.nodeOutlet.length && this._children) {
            const viewContainer = this.nodeOutlet.first.viewContainer;
            this._tree._renderNodeChanges(this._children, this._dataDiffer, viewContainer, this._data);
        } else {
            // Reset the data differ if theres no children nodes displated
            this._dataDiffer.diff([]);
        }
    }

    /** Embeds a view at the drop point */
    protected _embbedView(context: any): void {
        this._viewContainer.createEmbeddedView(this._tree._defaultNodeDef.template, context);
        SlkTreeNodeDirective.mostRecentTreeNode.data = context.$implicit;
    }

    /** Embeds a view at the drop point */
    protected _embedView(context: any, containerRef: any): void {
        let containerRefToEmbed: ViewContainerRef;
        for (let i = 0; i < this._tree.viewContainerRef.length; i++) {
            for (let j = 0; j < this._tree.viewContainerRef[i]._embeddedViews.length; j++) {
                if (this._tree.viewContainerRef[i]._embeddedViews[j].context ===
                    containerRef.view.context) {
                    containerRefToEmbed = this._tree.viewContainerRef[i];
                    break;
                }
            }
        }
        let currentViewRef: EmbeddedViewRef<any> | null = null;
        this.actionService.get(viewRefKey)
            .pipe(takeUntil(this._destroyed))
            .subscribe((_viewRef: EmbeddedViewRef<any>) => {
                currentViewRef = _viewRef;
                this._droppedViewRef = _viewRef;
                /** Inserts the view ref into the view container ref of drop point. */
                containerRefToEmbed.insert(this._droppedViewRef);
            });
    }
    /** Removes the view from the drag point */
    protected _removeView(): void {
        // let currentViewRef: EmbeddedViewRef<any>,
        let currentViewContainerRef: ViewContainerRef;
        this.actionService.get(viewRefContainer)
            .pipe(takeUntil(this._destroyed))
            .subscribe((_viewContainerRef: ViewContainerRef) => {
                currentViewContainerRef = _viewContainerRef;
                const index = currentViewContainerRef.indexOf(this._droppedViewRef);
                currentViewContainerRef.remove(index);
            });
    }

    /** Clear the children dataNodes */
    protected _clear(): void {
        if (this.nodeOutlet && this.nodeOutlet.first) {
            this.nodeOutlet.first.viewContainer.clear();
            this._dataDiffer.diff([]);
        }
    }
}
