import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'select-org',
    loadChildren: () => import('./select-org/select-org.module').then( m => m.SelectOrgPageModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then( m => m.ActivityPageModule)
  },
  {
    path: 'dashboard',
    children: [
      {
        path: '',
        loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
      }
    ]
  },
  {
    path: 'my-resp',
    loadChildren: () => import('./my-resp/my-resp.module').then( m => m.MyRespPageModule)
  },
  {
    path: 'goods-receipt',
    loadChildren: () => import('./goods-receipt/goods-receipt.module').then( m => m.GoodsReceiptPageModule)

  },
  {
    path: 'trans-hist',
    loadChildren: () => import('./trans-hist/trans-hist.module').then( m => m.TransHistPageModule)
  },
  {
    path: 'common-shared-list-page',
    loadChildren: () => import('./common-shared-list-page/common-shared-list-page.module').then( m => m.CommonSharedListPagePageModule)
  },
  {
    path: 'lot-list',
    loadChildren: () => import('./lot-list/lot-list.module').then( m => m.LotListPageModule)
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
