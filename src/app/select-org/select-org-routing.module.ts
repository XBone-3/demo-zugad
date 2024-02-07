import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectOrgPage } from './select-org.page';

const routes: Routes = [
  {
    path: '',
    component: SelectOrgPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectOrgPageRoutingModule {}
