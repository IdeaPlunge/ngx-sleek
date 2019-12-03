import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
    Inject
} from '@angular/core';
import { OPTIONS_DIALOG_DATA } from '../grid-filter';
import { ActionsService } from '../tree';

export const selectedOptions = 'selected-options';

@Component({
    selector: 'slk-filter-popup',
    templateUrl: 'grid-popup.html',
    styleUrls: ['grid-popup.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SlkGridPopupComponent<T> implements
    OnInit,
    OnDestroy {
    // protected _onDestroy: Subject<any> = new Subject();

    protected collectedVal: T[] = [];

    constructor(
        @Inject(OPTIONS_DIALOG_DATA) public data: any[],
        protected cacheService: ActionsService
    ) {
        this.data.unshift({ name: 'Select All', checked: false });
    }

    ngOnInit() {
    }
    ngOnDestroy() {
        // this._onDestroy.next();
        // this._onDestroy.complete();
    }

    onInputChange(value: any) {
        // Select all
        if (parseInt(value, 10) === 0) {
            const updatedData = this.data.map((obj: any) => {
                if (this.data[0].checked) {
                    return {
                        ...obj,
                        checked: false
                    }
                } else {
                    return {
                        ...obj,
                        checked: true
                    }
                }
            });
            this.data = updatedData;
            const cachedData = updatedData.map((obj: any) => {
                return obj.name;
            });
            this.cacheService.set(selectedOptions, cachedData);
        } else {
            this.collectedVal.push(this.data[value].name);
            // Cache the selected values.
            this.cacheService.set(selectedOptions, this.collectedVal);
        }
    }
}
