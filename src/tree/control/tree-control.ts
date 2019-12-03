import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

export interface TreeControl<T> {
    /** Get depth of a given data node, return the level number. This is for flat tree node. */
    readonly getLevel: (dataNode: T) => number;
    /**
     * Whether the data node is expandable.
     */
    readonly isExpandable: (dataNode: T) => boolean;
    /** Gets a stream that emits whenever the given data node's children change. */
    readonly getChildren: (dataNode: T) => Observable<T[]>;
    /** The saved tree nodes data for 'expandAll' action. */
    dataNodes: T[];
    /** The expansion model */
    expansionModel: SelectionModel<T>;
    /** Whether the data node is expanded or collapsed. Return true if it's expanded. */
    isExpanded(dataNode: T): boolean;
    /** Whether the data node is expanded or collapsed. */
    isExpanded(dataNode: T): boolean;
    /** Get all descendants */
    getDescendants(dataNode: T): any[];
    /** Expand or collapse data node */
    toggle(dataNode: T): void;
    /** Expand one data node. */
    expand(dataNode: T): void;
    /** collapse one data node. */
    collapse(dataNode: T): void;
    /** Collapse all the dataNodes in the tree */
    collapseAll(): void;
    /** Toggle a data node by expand/collapse it and all its descendants */
    toggleDescendants(dataNode: T): void;
    /** Expand a data node and all its descendants */
    expandDescendants(dataNode: T): void;
    /** Collapse a data node and all its descendants */
    collapseDescendants(dataNode: T): void;
}
