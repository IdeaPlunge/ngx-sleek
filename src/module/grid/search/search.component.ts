/*
    Created By Vikram
*/

import {
    Component,
    OnInit,
    Output,
    EventEmitter
} from '@angular/core';

@Component({
    selector: 'slk-search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.scss']
})

export class NgxSearchComponent implements OnInit {

    @Output() filterTable = new EventEmitter();

    constructor(
    ) { }

    ngOnInit() {
    }

    textChange($event: any) {
        this.filterTable.emit($event);
    }
}
