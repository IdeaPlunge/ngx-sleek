import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkTreeModule } from 'ngx-sleek';
import { TreeComponent } from './tree';

@NgModule({
    imports: [
        CommonModule,
        SlkTreeModule
    ],
    declarations: [TreeComponent]
})
export class TreeModule { }
