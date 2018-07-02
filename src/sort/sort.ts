import { SortDirection } from './sort-header';
import {
    Directive,
    OnChanges,
    OnDestroy,
    OnInit,
    Input,
    EventEmitter,
    Output
} from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

/** Interface for directive that holds sorting state consumed by SlkSortHeader */
export interface SlkSortable {
    /** The id of the column being sorted. */
    id: string;
    /** Sort direction. */
    start: 'asc' | 'desc';
}

/** Current sort state. */
export interface Sort {
    /** The id of the column being sorted. */
    active: string;
    /** The Sort Direction */
    direction: SortDirection;
}

/** Container for SlkSortables to manage the sort state and provide default sort paramters. */
@Directive({
    selector: '[slkSort]',
    exportAs: 'slkSort'
})
export class SlkSortDirective implements OnChanges, OnDestroy, OnInit {
    /** Collection of all registered sortables that this directive manages. */
    sortables = new Map<string, SlkSortable>();
    /** Used to notify any child components listening to state changes. */
    readonly _stateChanges = new Subject<void>();
    /** Emit initialised value when directive is initialised. */
    initialised = new BehaviorSubject<boolean>(false);

    /** The id of the most recently sorted SlkSortable. */
    @Input('slkSortActive') active: string;
    /**
     * The direction to set when an SlkSortable is initially sorted.
     */
    @Input('slkSortStart') start: 'asc' | 'desc' = 'asc';
    /** The sort direction of the currently active SlkSortable. */
    @Input('slkSortDirection')
    get direction(): SortDirection { return this._direction; }
    set direction(direction: SortDirection) {
        this._direction = direction;
    }
    private _direction: SortDirection = '';
    /** Event emiited when the user changes either the active sort or sort direction. */
    @Output('slkSortChange') readonly slkSortChange: EventEmitter<Sort> = new EventEmitter<Sort>();
    /**
     * Register function to be used by the contained SlkSortables. Adds the SlkSortable to
     * the collection of SlkSortables.
     */
    register(sortable: SlkSortable): void {
        this.sortables.set(sortable.id, sortable);
    }
    /**
     * Unregister function to be used by the container SlkSortables. Removes the SlkSortable from
     * the collection of contained SlkSortables.
     */
    deregister(sortable: SlkSortable): void {
        this.sortables.delete(sortable.id);
    }
    /** Sets the active sort id and determines the new sort direction. */
    sort(sortable: SlkSortable): void {
        // console.log('slk', sortable);
        if (this.active !== sortable.id) {
            this.active = sortable.id;
            this.direction = sortable.start ? sortable.start : this.start;
        } else {
            this.direction = this.getNextSortDirection(sortable);
        }
        this.slkSortChange.emit({ active: this.active, direction: this.direction });
    }
    /** Returns the next sort direction of the active sortable. */
    getNextSortDirection(sortable: SlkSortable): SortDirection {
        // Get the sort direction cycle.
        const sortDirectionCycle = getSortDirectionCycle(sortable.start);
        // Get and return the next direction in the cycle.
        let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
        if (nextDirectionIndex >= sortDirectionCycle.length) {
            nextDirectionIndex = 0;
        }
        return sortDirectionCycle[nextDirectionIndex];
    }
    ngOnInit() {
        this.initialised.next(true);
    }
    ngOnChanges() {
        this._stateChanges.next();
    }
    ngOnDestroy() {
        this._stateChanges.complete();
        this.initialised.complete();
    }
}
/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: 'asc' | 'desc'): SortDirection[] {
    const sortOrder: SortDirection[] = ['asc', 'desc'];
    if (start === 'desc') { sortOrder.reverse(); }
    return sortOrder;
}
