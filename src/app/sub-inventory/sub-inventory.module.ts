import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubInventoryPageRoutingModule } from './sub-inventory-routing.module';

import { SubInventoryPage } from './sub-inventory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubInventoryPageRoutingModule
  ],
  // declarations: [SubInventoryPage]
})
export class SubInventoryPageModule {}
