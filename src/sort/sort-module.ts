import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkSortDirective } from './sort';
import { SlkSortHeaderComponent } from './sort-header';

@NgModule({
    imports: [CommonModule],
    exports: [SlkSortDirective, SlkSortHeaderComponent],
    declarations: [SlkSortDirective, SlkSortHeaderComponent]
})

export class SlkSortModule { }
