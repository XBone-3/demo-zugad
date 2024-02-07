import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransHistPageRoutingModule } from './trans-hist-routing.module';

import { TransHistPage } from './trans-hist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransHistPageRoutingModule
  ],
  declarations: [TransHistPage]
})
export class TransHistPageModule {}
