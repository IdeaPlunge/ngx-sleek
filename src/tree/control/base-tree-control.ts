import { TreeControl } from './tree-control';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';



export abstract class BaseTreeControl<T> implements TreeControl<T> {
    /** Saved data node for expandAll action. */
    dataNodes: T[];
    /** A Selection model with multi-selection to track expansion status. */
    expansionModel: SelectionModel<T> = new SelectionModel<T>(true);
    /** Get depth of a given data node, return the level number. this is for flat tree node. */
    getLevel: (dataNode: T) => number;
    /**
     * Whether the data node is expandable. Returns true if expandable.
     */
    isExpandable: (dataNode: T) => boolean;
    /** Get a stream that emits whenever the given data node's children change. */
    getChildren: (dataNode: T) => Observable<T[]>;
    /** Toggles one single data node;s expanded/collapsed state. */
    toggle(dataNode: T): void {
        this.expansionModel.toggle(dataNode);
    }
    /** Expands one single data node. */
    expand(dataNode: T): void {
        this.expansionModel.select(dataNode);
    }
    /** Collapses one single data node. */
    collapse(dataNode: T): void {
        this.expansionModel.deselect(dataNode);
    }
    /** Whether a given data node is expanded or not. */
    isExpanded(dataNode: T): boolean {
        return this.expansionModel.isSelected(dataNode);
    }
    /** Toggles a subtree rooted at node recursively */
    toggleDescendants(dataNode: T): void {
        this.expansionModel.isSelected(dataNode)
            ? this.collapseDescendants(dataNode)
            : this.expandDescendants(dataNode);
    }
    /** Collapse all dataNodes in the tree. */
    collapseAll(): void {
        this.expansionModel.clear();
    }
    /** Expands a subtree rooted at given data node recursively. */
    expandDescendants(dataNode: T): void {
        const toBeProcessed = [dataNode];
        toBeProcessed.push(...this.getDescendants(dataNode));
        this.expansionModel.select(...toBeProcessed);
    }
    /** Collapses a subtree rooted at given data node recursively. */
    collapseDescendants(dataNode: T): void {
        const toBeProcessed = [dataNode];
        toBeProcessed.push(...this.getDescendants(dataNode));
        this.expansionModel.deselect(...toBeProcessed);
    }
    /** Gets a list of descendant data nodes of a subtree rooted at given data node recursively. */
    abstract getDescendants(dataNode: T): T[];
    /** Expands all data nodes in the tree. */
    abstract expandAll(): void;


}
