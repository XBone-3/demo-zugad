import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ItemDetailsPageRoutingModule } from './item-details-routing.module';
import { ItemDetailsPage } from './item-details.page';
import { SubInvPage } from 'src/app/shared-components/sub-inv/sub-inv.page';
import { LocatorPage } from 'src/app/shared-components/locator/locator.page';
import { ItemRevisionPage } from 'src/app/shared-components/item-revision/item-revision.page';
import { LotPage } from 'src/app/shared-components/lot/lot.page';
import { SerialPage } from 'src/app/shared-components/serial/serial.page';
import { UomPage } from 'src/app/shared-components/uom/uom.page';
import { ScanPage } from 'src/app/shared-components/scan/scan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemDetailsPageRoutingModule
  ],
  declarations: [
    ItemDetailsPage,
    SubInvPage,
    LocatorPage,
    ItemRevisionPage,
    LotPage,
    SerialPage,
    UomPage
  ]
})
export class ItemDetailsPageModule {}
