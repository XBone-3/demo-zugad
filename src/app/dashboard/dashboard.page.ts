import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';
import { ActivatedRoute } from '@angular/router';
import { SqliteService } from '../providers/sqlite.service';
import { TableNames } from '../CONSTANTS/CONSTANTS';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  isUserLoaded: boolean = false;
  isOrgLoaded: boolean = false;
  username: any;
  orgDetails: any;
  headerTitle: string = '';
  totalRecords: any;
  totalHistory: any;
  totalReceipts: any;
  responsibilities: any;
  activatedSubscription!: Subscription;
  totalTrans: any;

  constructor(
    private apiService: NodeApiService,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private activatedRoute: ActivatedRoute,
    private sqliteService: SqliteService
  ) { 
  }

  async ngOnInit() {
    this.orgDetails = await this.apiService.getValue('selectedOrg')
    this.isOrgLoaded = true;

    this.responsibilities = await this.getResponsibilities();

    this.activatedSubscription = this.activatedRoute.paramMap.subscribe( async (paramMap) => {
      if (!paramMap.has('id')) {
        this.closeMenu();
        return;
      }

      const id = paramMap.get('id');

      if (id === 'logout') {
        await this.logout();
        return;
      }

      if (id === 'logout-clear') {
        await this.logout();
        await this.apiService.clearStorage();
        return;
      }

    })
    // console.log("ngOnInit dashboard", new Date());
  }

  async ionViewDidEnter() {
    try {
      const trans_data = await this.sqliteService.getDataFromTable(TableNames.TRANSACTIONS)
      if (trans_data.rows.length > 0) {
        this.totalTrans = trans_data.rows.length;
      } else {
        this.totalTrans = '0';
      }
    } catch (error) {
      this.totalTrans = '0';
    }
    
    const query = `SELECT PoNumber, PoType, VendorName, LastUpdateDate FROM ${TableNames.DOCS4RECEIVING} 
                    WHERE SourceTypeCode='PO' 
                    And 
                    PoNumber IS NOT NULL
                    ORDER BY PoNumber`;
    try {
      const docs_4_rec_data = await this.sqliteService.executeCustonQuery(query)
      if (docs_4_rec_data.rows.length > 0) {
        this.totalReceipts = docs_4_rec_data.rows.length;
      } else {
        this.totalReceipts = '0';
      }
    } catch (error) {
      this.totalReceipts = '0';
    }
    
  }

  async getResponsibilities() {
    return this.apiService.getValue('responsibilities');
  }

  goToRecords() {
    this.navCtrl.navigateForward('/dashboard/records');
  }

  goToHistory() {
    this.navCtrl.navigateForward('/dashboard/history');
  }

  goToGoodsReceipt() {
    this.navCtrl.navigateForward('/goods-receipt');
  }

  goToTransHistory() {
    this.navCtrl.navigateForward('/trans-hist');
  }

  closeMenu() {
    this.menuCtrl.close();
  }

  async logout() {
    await this.apiService.clearStorage();
    await this.sqliteService.dropAllTables();
    this.navCtrl.navigateRoot('/login');
  }

  selectOrg() {
    this.navCtrl.navigateForward('/all-user-organisation');
  }

  ngOnDestroy() {
    if (this.activatedSubscription) {
      this.activatedSubscription.unsubscribe();
    }
  }
}
