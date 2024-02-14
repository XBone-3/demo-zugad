import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadSubInvPageRoutingModule } from './load-sub-inv-routing.module';

import { LoadSubInvPage } from './load-sub-inv.page';
import { ItemDetailsPage } from 'src/app/goods-receipt/item-details/item-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadSubInvPageRoutingModule
  ],
  declarations: [LoadSubInvPage],
  bootstrap: [ItemDetailsPage]
})
export class LoadSubInvPageModule {}
