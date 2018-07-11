import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkSortDirective } from './sort';
import { SlkSortHeaderComponent } from './sort-header';
import { SortDirectiveService } from './sort-directive.service';

@NgModule({
    imports: [CommonModule],
    exports: [SlkSortDirective, SlkSortHeaderComponent],
    declarations: [SlkSortDirective, SlkSortHeaderComponent],
    providers: [SortDirectiveService]
})

export class SlkSortModule { }
