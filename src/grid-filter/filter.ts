import {
    Directive,
    OnInit,
    OnDestroy,
    Output,
    EventEmitter,
    Input,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
    selector: '[slkFilter]',
    exportAs: 'slkFilter'
})
export class SlkGridFilterDirective implements OnInit, OnDestroy {
    /** Collection of all registered filters that this directive manages. */
    filterColumns = new Map<string, any>();
    /** emit initialised value when directive is initialised. */
    initialised = new BehaviorSubject<boolean>(false);

    public selectedOptions: any[] = [];
    public key: string | number;
    /** The id of the most recently filtered column. */
    @Input('slkFilterActive') active: string | number;

    /** Event emitted when user types a keyword. */
    @Output('slkFilterChange') readonly slkFilterChange: EventEmitter<any> = new EventEmitter();

    constructor() { }

    /** Gets the word and the active column for filtering. */
    public filter(selectedOptions: any[], columnId: string | number, key?: any): void {
        if (key) {
            this.key = key;
        }
        this.selectedOptions = selectedOptions;
        this.active = columnId;
        this.slkFilterChange.emit({ data: selectedOptions });
    }
    ngOnInit() {
        this.initialised.next(true);
    }
    ngOnDestroy() {
        this.initialised.complete();
    }
}
