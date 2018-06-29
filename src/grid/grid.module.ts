import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// Export module's public API
import { NgxGridComponent } from './grid.component';
import { NgxGridService } from './grid.service';

@NgModule({
  imports: [
    CommonModule,
    // FormsModule
  ],
  exports: [
    NgxGridComponent
  ],
  declarations: [
    NgxGridComponent
  ]
})
export class GridModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GridModule,
      providers: [NgxGridService]
    };
  }
}
