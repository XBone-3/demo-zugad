import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadSubInvPage } from './load-sub-inv.page';

const routes: Routes = [
  {
    path: '',
    component: LoadSubInvPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadSubInvPageRoutingModule {}
