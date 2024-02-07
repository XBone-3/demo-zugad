import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectOrgPageRoutingModule } from './select-org-routing.module';

import { SelectOrgPage } from './select-org.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectOrgPageRoutingModule
  ],
  declarations: [SelectOrgPage]
})
export class SelectOrgPageModule {}
