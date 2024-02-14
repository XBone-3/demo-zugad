import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubInventoryPage } from './sub-inventory.page';

const routes: Routes = [
  {
    path: '',
    component: SubInventoryPage
  },
  {
    path: 'load-sub-inv',
    loadChildren: () => import('./load-sub-inv/load-sub-inv.module').then( m => m.LoadSubInvPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubInventoryPageRoutingModule {}
