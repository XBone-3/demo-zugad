import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ItemDetailsPageRoutingModule } from './item-details-routing.module';
import { ItemDetailsPage } from './item-details.page';
import { SubInventoryPage } from 'src/app/sub-inventory/sub-inventory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemDetailsPageRoutingModule
  ],
  declarations: [
    ItemDetailsPage,
    SubInventoryPage
  ]
})
export class ItemDetailsPageModule {}
