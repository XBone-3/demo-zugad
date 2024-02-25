import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';
import { 
  TableNames,
  ApiSettings,
  Org,
  MESSAGES,
  TypeOfApi,
  RESPONSIBILITIES,
  Color
  } from '../CONSTANTS/CONSTANTS';
import { SqliteService } from '../providers/sqlite.service';
import { UiProviderService } from '../providers/ui-provider.service';
import { AuthService } from '../login/auth.service';
import { SharedService } from '../providers/shared.service';
import { NetworkService } from '../providers/network.service';
import { TransactionService } from '../providers/transaction.service';
import { MasterConfigService } from '../providers/master-config.service';


@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {

  organisation: Org | any;
  isOrgLoaded: boolean = false;
  defaultOrgId: any;
  loadLocations: string = 'Locations';
  loadLocationStatus: boolean = true;
  loadDocsForReceiving: string = 'Docs For Receiving';
  loadDocsForReceivingStatus: boolean = true;
  loadSubInventoryStatus: boolean = true;
  loadSubInventoryMessage: string = 'Sub Inventories';
  subInventories: any;
  responsibilities: any;
  isRespLoaded: boolean = false;
  locationsData: any;
  docsForReceivingColumns: any;
  locations: number = 0
  docs: number = 0
  metadataLoaded: boolean = false;
  syncAgain: boolean = false;
  success: boolean = true;
  isOnline: boolean = false;
  loadGlPeriodsMessage: string = 'GL Periods';
  loadGlPeriodStatus: boolean = true;
  loadUomMessage: string = 'UOM';
  loadUomStatus: boolean = true;
  loadRevisionsMessage: string = 'Revisions';
  loadRevisionsStatus: boolean = true;
  loadPurchasingPeriodsMessage: string = 'Purchasing Periods';
  loadPurchasingPeriodsStatus: boolean = true;
  loadReasonsMessage: string = 'Reasons';
  loadReasonsStatus: boolean = true;
  loadLocatorsMessage: string = 'Locators';
  loadLocatorsStatus: boolean = true;
  loadLotsMessage: string = 'Lots';
  loadLotsStatus: boolean = true;
  loadSerialsMessage: string = 'Serials';
  loadSerialsStatus: boolean = true;
  constructor(
    private apiService: NodeApiService,
    private navCtrl: NavController,
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private authService: AuthService,
    private sharedService: SharedService,
    private networkService: NetworkService,
    private transactionService: TransactionService,
    private masterConfigService: MasterConfigService
  ) { }

  async ngOnInit() {
    try {
      this.organisation = await this.apiService.getValue('selectedOrg')
      this.isOrgLoaded = true;
    } catch (error) {
      this.uiProviderService.presentAlert(MESSAGES.ERROR, 'No Organisation data available');
      this.logout();
    }
    try {
      this.defaultOrgId = await this.apiService.getValue('orgId')
    } catch (error) {
      this.uiProviderService.presentAlert(MESSAGES.ERROR, 'No Organisation data available');
      this.logout();
    }
    try {
      this.responsibilities = await this.apiService.getValue('responsibilities')
    this.isRespLoaded = true;
    } catch (error) {
      this.uiProviderService.presentAlert(MESSAGES.ERROR, 'No Responsibilities data available');
      this.logout
    }
    this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.isOnline = networkStatus
    })
   
    await this.sharedService.createTransactionHistoryTable(TableNames.TRANSACTIONS);
  }

  async ionViewDidEnter() {
    if(this.isOnline){
      try {
        const metadata = await this.masterConfigService.masterConfigApiCall(this.defaultOrgId, this.organisation);
        const LoadTransaction = metadata.every((data: any) => data === true);
        if (LoadTransaction) {
          const transactionStatus = await this.transactionService.getTransactionalData(this.defaultOrgId, this.organisation);
          const forwardToDashboard = transactionStatus.every((data: any) => data === true);
          if (forwardToDashboard) {
            this.navigateToDashboard();
          } else {
            this.syncAgain = true
          }
        } else {
          this.syncAgain = true
        }
      } catch (error) {
        console.error('ion view', error);
      }
    } else {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'No network available', Color.ERROR);
      this.syncAgain = true
    } 
  }

  generateParams(name: string) {
    if (name === RESPONSIBILITIES.GL_PERIODS || name === RESPONSIBILITIES.INVENTORY_PERIODS || name === RESPONSIBILITIES.PURCHASING_PERIODS) {
      return `${this.defaultOrgId}`
    } else if (name === RESPONSIBILITIES.REVISIONS || name === RESPONSIBILITIES.UOM || name === RESPONSIBILITIES.LOTS) {
      return `${this.organisation.InventoryOrgId_PK}/''` 
    } else if (name === RESPONSIBILITIES.SUB_INVENTORY || name === RESPONSIBILITIES.DOCS4RECEIVING) {
      return `${this.organisation.InventoryOrgId_PK}/""/""`
    } else if (name === RESPONSIBILITIES.LOCATORS) {
      return `${this.organisation.InventoryOrgId_PK}/${this.authService.lastLoginDate}/""`
    } else if (name === RESPONSIBILITIES.SERIALS) {
      return `${this.organisation.InventoryOrgId_PK}/""/""/""`
    } else {
      return ''
    }
  }


  async onSyncAgain() {
    this.ionViewDidEnter();
    this.syncAgain = false;
  }

  navigateToDashboard() {
    if (this.success) {
      this.navCtrl.navigateForward('/dashboard');
    } else {
      this.syncAgain = true
    }
  }

  async logout() {
    await this.apiService.clearStorage();
    await this.sqliteService.dropAllTables();
    this.navCtrl.navigateRoot('/login');
  }
  
}
