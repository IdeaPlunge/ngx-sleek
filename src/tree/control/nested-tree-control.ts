import { BaseTreeControl } from './base-tree-control';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';


export class NestedTreeControl<T> extends BaseTreeControl<T> {
    constructor(public getChildren: (dataNode: T) => Observable<T[]>) {
        super();
    }

    /** Expands all dataNodes in the tree. */
    expandAll(): void {
        this.expansionModel.clear();
        const allNodes = this.dataNodes.reduce((accumulator, dataNode) =>
            [...accumulator, ...this.getDescendants(dataNode), dataNode], []);
        this.expansionModel.select(...allNodes);
    }
    /** Get a list of descendant dataNodes of a subtree rooted at given data node recursively. */
    getDescendants(dataNode: T): T[] {
        const descendants: T[] = [];
        this._getDescendants(descendants, dataNode);
        return descendants.splice(1);
    }
    /** A helper function to get descendants recursively. */
    protected _getDescendants(descendants: T[], dataNode: T): void {
        descendants.push(dataNode);
        this.getChildren(dataNode).pipe(take(1)).subscribe(children => {
            if (children && children.length > 0) {
                children.forEach((child: T) => this._getDescendants(descendants, child));
            }
        });
    }
}
