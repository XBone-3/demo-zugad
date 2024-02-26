import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScanCComponent } from '../shared-components/scan-c/scan-c.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    ScanCComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ScanCComponent
  ]
})
export class SharedModule { }
