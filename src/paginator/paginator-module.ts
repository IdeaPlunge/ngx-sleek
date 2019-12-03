import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkPaginatorChildComponent, SlkPaginatorComponent } from './paginator';
import { SlkNavDirective, SlkPageIndexDirective } from './page-nav';

@NgModule({
    imports: [CommonModule],
    exports: [
        SlkPaginatorComponent,
        SlkPaginatorChildComponent,
        SlkNavDirective,
        SlkPageIndexDirective
    ],
    declarations: [
        SlkPaginatorComponent,
        SlkPaginatorChildComponent,
        SlkNavDirective,
        SlkPageIndexDirective
    ]
})
export class SlkPaginatorModule { }
