import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkGridFilterComponent } from './grid-filter';
import { SlkGridFilterDirective } from './filter';
import { DomService } from './grid-filter-service';
import { SlkGridPopupComponent } from '../grid-popup';
import { SlkGridPopupModule } from '../grid-popup';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
    imports: [
        CommonModule,
        SlkGridPopupModule,
        OverlayModule
    ],
    exports: [SlkGridFilterComponent, SlkGridFilterDirective],
    declarations: [SlkGridFilterComponent, SlkGridFilterDirective],
    entryComponents: [
        // Needs to be added here because otherwise we can't
        // dynamically render this component at runtime
        SlkGridPopupComponent
    ],
    providers: [DomService]
})
export class SlkFilterModule { }
