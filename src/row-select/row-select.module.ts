import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkSelectRowComponent } from './row-select';
import { SlkRowSelectDirective } from './row-select.directive';
import { RowSelectService } from './row-select.service';

@NgModule({
    imports: [CommonModule],
    exports: [SlkSelectRowComponent, SlkRowSelectDirective],
    declarations: [SlkSelectRowComponent, SlkRowSelectDirective],
    providers: [RowSelectService]
})

export class SlkRowSelectModule { }
