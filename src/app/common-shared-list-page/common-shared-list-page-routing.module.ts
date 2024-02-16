import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonSharedListPage } from './common-shared-list-page.page';

const routes: Routes = [
  {
    path: '',
    component: CommonSharedListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonSharedListPagePageRoutingModule {}
