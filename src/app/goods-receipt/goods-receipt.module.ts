import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoodsReceiptPageRoutingModule } from './goods-receipt-routing.module';

import { GoodsReceiptPage } from './goods-receipt.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoodsReceiptPageRoutingModule,
    SharedModule
  ],
  declarations: [
    GoodsReceiptPage
  ]
})
export class GoodsReceiptPageModule {}
