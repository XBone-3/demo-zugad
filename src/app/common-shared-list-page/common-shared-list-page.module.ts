import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommonSharedListPagePageRoutingModule } from './common-shared-list-page-routing.module';

import { CommonSharedListPage } from './common-shared-list-page.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CommonSharedListPagePageRoutingModule,
    SharedModule
  ],
  declarations: [CommonSharedListPage]
})
export class CommonSharedListPagePageModule {}
