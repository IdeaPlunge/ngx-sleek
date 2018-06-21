import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Export module's public API
import { NgxSearchComponent } from './grid/search/search.component';
import { NgxGridComponent } from './grid/grid.component';
import { NgxGridService } from './grid/grid.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule
  ],
  exports: [
    NgxGridComponent,
    NgxSearchComponent
  ],
  declarations: [
    NgxGridComponent,
    NgxSearchComponent
  ]
})
export class LibModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LibModule,
      providers: [NgxGridService]
    };
  }
}
