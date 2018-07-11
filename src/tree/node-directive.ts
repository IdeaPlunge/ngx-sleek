import {
    Directive,
    OnDestroy,
    ElementRef,
    Input
} from '@angular/core';
import { Subject } from 'rxjs';
import { SlkTreeComponent } from './tree';
import { takeUntil } from 'rxjs/operators';
/**
 * Tree node for SlkTreeComponent.
 */
@Directive({
    selector: 'slk-tree-node',
    exportAs: 'slkTreeNode'
})
export class SlkTreeNodeDirective<T> implements OnDestroy {
    /**
     * The most recently created SlkTreeNode. We save it in static variable so we can retreive it
     * in 'SlkTreeComponent' and set the data to it.
     */
    static mostRecentTreeNode: SlkTreeNodeDirective<{}> | null = null;

    /** Subject that emits when the component has been destroyed. */
    protected _destroyed = new Subject<void>();

    /** The tree node's data. */
    get data(): T { return this._data; }
    set data(value: T) {
        // console.log('value', value);
        this._data = value;
        this._setRoleFromData();
    }
    protected _data: T;

    get isExpanded(): boolean {
        return this._tree.treeControl.isExpanded(this._data);
    }

    get level(): number {
        return this._tree.treeControl.getLevel ? this._tree.treeControl.getLevel(this._data) : 0;
    }

    /**
     * The role of the node should be group if its an internal node
     * and treeitem if its a leaf node.
     */
    @Input() role: 'treeitem' | 'group' = 'treeitem';

    constructor(
        protected _elementRef: ElementRef,
        protected _tree: SlkTreeComponent<T>
    ) {
        SlkTreeNodeDirective.mostRecentTreeNode = this as SlkTreeNodeDirective<T>;
    }

    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }

    private _setRoleFromData(): void {
        if (this._tree.treeControl.isExpandable) {
            this.role = this._tree.treeControl.isExpandable(this._data) ? 'group' : 'treeitem';
        } else {
            if (!this._tree.treeControl.getChildren) { }
            this._tree.treeControl.getChildren(this._data).pipe(takeUntil(this._destroyed))
                .subscribe((children: T[]) => {
                    this.role = children && children.length ? 'group' : 'treeitem';
                });
        }
    }
}
