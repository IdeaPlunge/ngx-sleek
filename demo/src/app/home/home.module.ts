import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  SlkGridModule, SlkSortModule  } from 'ngx-sleek';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
    imports: [
        CommonModule,
        // SlkGridModule.forRoot(),
        HomeRoutingModule,
        SlkGridModule,
        SlkSortModule
    ],
    declarations: [HomeComponent],
})
export class HomeModule { }
