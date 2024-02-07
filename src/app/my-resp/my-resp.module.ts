import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyRespPageRoutingModule } from './my-resp-routing.module';

import { MyRespPage } from './my-resp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyRespPageRoutingModule
  ],
  declarations: [MyRespPage]
})
export class MyRespPageModule {}
