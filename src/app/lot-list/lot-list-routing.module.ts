import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LotListPage } from './lot-list.page';

const routes: Routes = [
  {
    path: '',
    component: LotListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LotListPageRoutingModule {}
