import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { NgxGridComponent } from './grid/grid.component';
import { NgxGridService } from './grid/grid.service';

// Export module's public API
export { NgxGridComponent } from './grid/grid.component';
export { NgxGridService } from './grid/grid.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [NgxGridComponent],
  declarations: [NgxGridComponent]
})
export class LibModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LibModule,
      providers: [NgxGridService]
    };
  }
}
