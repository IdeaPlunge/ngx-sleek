import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnInit,
    Renderer2,
    Directive,
    TemplateRef,
    ViewContainerRef,
    Input,
    OnDestroy,
    EmbeddedViewRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ActionsService, viewRefKey, viewRefContainer, dataNode } from './tree-service';
import { takeUntil } from 'rxjs/operators';
import { SlkTreeTextOutletDirective } from './tree-nest-outlet';
import { SlkNestedTreeNodeDirective } from './nested-node';
import { NestedTreeControl } from './control';
import { SlkTreeComponent } from './tree';

export class SlkContentActionContext {
    public $implicit: any = null;
    public appContentAction: any = null;
}


@Component({
    selector: 'slk-tree-nest-text',
    templateUrl: 'tree-nest-node.html',
    // template: ` <ng-container [ngTemplateOutlet]="template"></ng-container>`,
    // take the reference of child and pass it to ng-container
    styleUrls: ['tree.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SlkTreeNodeTextComponent<T>
    extends SlkTreeTextOutletDirective<T>
    implements OnInit, OnDestroy {
    private _onDestroy: Subject<boolean> = new Subject();
    isAction = false;

    nestedTreeControl: NestedTreeControl<T>;

    nodeMap = new Map<any, any>();

    isExpandable = (node: any) => node.expandable;

    expand: boolean;
    collapse = false;

    constructor(
        private actionService: ActionsService,
        public nestedNode: SlkNestedTreeNodeDirective<T>,
        private treeComponent: SlkTreeComponent<T>,
    ) {
        super();

        this.nestedTreeControl = new NestedTreeControl<any>(this.isExpandable);
    }

    ngOnInit() {
        this.actionService.onAdd
            .pipe(takeUntil(this._onDestroy))
            .subscribe(result => {
                this.isAction = result;
            });

        if (this.data && this.data.hasOwnProperty('children')) {
            this.expand = true;
        } else {
            this.expand = false;
        }
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    onToggle() {
        this.treeComponent.treeControl.toggle(this.data);
        this.actionService.set(dataNode, this.data);
        // console.log('this.toggle', this.toggleDirective);
        if (this.data && this.data.hasOwnProperty('children')) {
            this.expand = false;
            this.collapse = true;
        } else {
            this.expand = false;
            this.collapse = false;
        }
    }

    onAdd(node: any = this.data) {
        // send a signal to the parent directive and make the directive
        // aware about type of action.
        // internally update dataSource as well
        const parentNode = this.nodeMap.get(node);
        node.children.push({});
        const tree: any = this.treeComponent.dataSource;
        tree.push(node);
        this.treeComponent.dataSource = [...tree];
        console.log('tree', tree);
        this.nestedTreeControl.expand(node);
    }
    onDestroy() {
        console.log('on destroy');
        this.actionService.onActChange(false);
    }
    onEdit() {
        console.log('on edit');
        this.actionService.onActChange(true);
    }
    /** Drag and drop, have ViewContainers and move the view from one ViewContainer to other */
    drag(event: DragEvent) {
        let currentViewContainerRef;
        for (let i = 0; i < this.treeComponent.viewContainerRef.length; i++) {
            for (let j = 0; j < this.treeComponent.viewContainerRef[i]._embeddedViews.length; j++) {
                if (this.treeComponent.viewContainerRef[i]._embeddedViews[j].context === this.context) {
                    currentViewContainerRef = this.treeComponent.viewContainerRef[i];
                    break;
                }
            }
        }

        let currentViewRef;
        for (let i = 0; i < this.treeComponent.cacheEmbeddedViewRef.length; i++) {
            if (this.treeComponent.cacheEmbeddedViewRef[i].context === this.context) {
                currentViewRef = this.treeComponent.cacheEmbeddedViewRef[i];
                break;
            }
        }

        event.dataTransfer.setData('nodeContext', JSON.stringify(this.context));

        /** Sets the current view ref and view container ref in the cache. */
        this.actionService.set(viewRefKey, currentViewRef);
        this.actionService.set(viewRefContainer, currentViewContainerRef);

    }
}



/** Directive */
@Directive({
    selector: '[slkContentAction]'
})
export class SlkAddActionDirective {
    /** Context for the template. */
    private _context: SlkContentActionContext = new SlkContentActionContext();
    /** Stores template ref condition is not true. */
    private _elseTemplateRef: TemplateRef<SlkContentActionContext> | null = null;
    /** Stores template ref condition is true. */
    private _thenTemplateRef: TemplateRef<SlkContentActionContext> | null = null;
    private _elseViewRef: EmbeddedViewRef<SlkContentActionContext> | null = null;
    private _thenViewRef: EmbeddedViewRef<SlkContentActionContext> | null = null;
    @Input()
    set appContentAction(condition: any) {
        this._context.$implicit = this._context.appContentAction = condition;
        this._updateView();
    }
    @Input()
    set appContentActionElse(templateRef: TemplateRef<SlkContentActionContext> | null) {
        this._elseTemplateRef = templateRef;
        this._elseViewRef = null;
        this._updateView();
    }
    constructor(
        public renderer: Renderer2,
        public templateRef: TemplateRef<any>,
        public viewContainer: ViewContainerRef
    ) {
        this._thenTemplateRef = templateRef;
    }

    _updateView() {
        if (this._context.$implicit) {
            if (!this._thenViewRef) {
                this.viewContainer.clear();
                this._elseViewRef = null;
                if (this._thenTemplateRef) {
                    this._thenViewRef = this.viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
                }
            }
        } else {
            if (!this._elseViewRef) {
                this.viewContainer.clear();
                this._thenViewRef = null;
                if (this._elseTemplateRef) {
                    this._elseViewRef =
                        this.viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
                    /** Tested to check remove method. */
                    // const index = this.viewContainer.indexOf(this._elseViewRef);
                    // this.viewContainer.remove(index);
                }
            }
        }
    }
}

