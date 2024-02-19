import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoodsReceiptPageRoutingModule } from './goods-receipt-routing.module';

import { GoodsReceiptPage } from './goods-receipt.page';
import { ScanPage } from '../shared-components/scan/scan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoodsReceiptPageRoutingModule
  ],
  declarations: [
    GoodsReceiptPage,
    ScanPage
  ]
})
export class GoodsReceiptPageModule {}
