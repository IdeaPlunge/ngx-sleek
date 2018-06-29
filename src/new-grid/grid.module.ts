import {
    SlkTableComponent,
    DataRowOutletDirective,
    HeaderRowOutletDirective,
    FooterRowOutletDirective
} from './grid';
import {
    SlkRowDefDirective,
    SlkCellOutletDirective,
    SlkRowComponent,
    SlkHeaderRowComponent,
    SlkHeaderRowDefDirective,
    SlkFooterRowComponent,
    SlkFooterRowDefDirective
} from './row';
import {
    SlkCellDefDirective,
    SlkHeaderCellDefDirective,
    SlkFooterCellDefDirective,
    SlkColumnDefDirective,
    SlkCellDirective,
    SlkHeaderCellDirective,
    SlkFooterCellDirective
} from './cell';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

const EXPORTED_DECLARATIONS = [
    SlkTableComponent,
    SlkRowDefDirective,
    SlkCellDefDirective,
    SlkCellOutletDirective,
    SlkHeaderCellDefDirective,
    SlkFooterCellDefDirective,
    SlkColumnDefDirective,
    SlkCellDirective,
    SlkRowComponent,
    SlkHeaderCellDirective,
    SlkFooterCellDirective,
    SlkHeaderRowComponent,
    SlkHeaderRowDefDirective,
    SlkFooterRowComponent,
    SlkFooterRowDefDirective,
    DataRowOutletDirective,
    HeaderRowOutletDirective,
    FooterRowOutletDirective
];

@NgModule({
    imports: [CommonModule],
    exports: EXPORTED_DECLARATIONS,
    declarations: EXPORTED_DECLARATIONS
})
export class SlkGridModule { }
