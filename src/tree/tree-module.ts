import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlkTreeComponent } from './tree';
import { SlkTreeNodeDefDirective } from './node';
import { SlkNestedTreeNodeDirective } from './nested-node';
import { SlkTreeNodeOutletDirective } from './outlet';
import { SlkTreeTextOutletDirective } from './tree-nest-outlet';
import { SlkTreeNodeTextComponent, SlkAddActionDirective } from './tree-nest-node';
import { ActionsService } from './tree-service';
import { SlkTreeActionDirective } from './tree-nest-outlet';
import { SlkTreeNodeDirective } from './node-directive';

const EXPORTED_DECLARATIONS = [
    SlkTreeComponent,
    SlkTreeNodeDirective,
    SlkTreeNodeDefDirective,
    SlkNestedTreeNodeDirective,
    SlkTreeNodeOutletDirective,
    SlkTreeNodeTextComponent,
    SlkTreeTextOutletDirective,
    SlkTreeActionDirective,
    SlkAddActionDirective
];
@NgModule({
    imports: [CommonModule],
    exports: EXPORTED_DECLARATIONS,
    declarations: EXPORTED_DECLARATIONS,
    providers: [
        SlkTreeNodeDefDirective,
        ActionsService
    ]
})
export class SlkTreeModule { }
