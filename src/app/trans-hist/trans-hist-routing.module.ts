import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransHistPage } from './trans-hist.page';

const routes: Routes = [
  {
    path: '',
    component: TransHistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransHistPageRoutingModule {}
