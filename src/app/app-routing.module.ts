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
      },
      {
        path: 'records',
        loadChildren: () => import('./dashboard/records/records.module').then( m => m.RecordsPageModule)
      },
      {
        path: 'history',
        loadChildren: () => import('./dashboard/history/history.module').then( m => m.HistoryPageModule)
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
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
