import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyRespPage } from './my-resp.page';

const routes: Routes = [
  {
    path: '',
    component: MyRespPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyRespPageRoutingModule {}
