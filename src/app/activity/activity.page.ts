import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';
import { 
  transactionTableName,
  Org,
  docsForReceivingTableName,
  subInventoryTableName,
  getReasonsTableName,
  locatorsTableName,
  glPeriodsTableName,
  inventoryPeriodsTableName,
  purchasingPeriodsTableName,
  lotsTableName,
  serialsTableName
  } from '../CONSTANTS/CONSTANTS';
import { SqliteService } from '../providers/sqlite.service';
import { ApiSettings } from '../CONSTANTS/api-settings';
import { Subscription } from 'rxjs';
import { UiProviderService } from '../providers/ui-provider.service';
import { AuthService } from '../login/auth.service';
import { SharedService } from '../providers/shared.service';


@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit, OnDestroy {

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
  locationsDataSubscription!: Subscription;
  docsForReceivingSubscription!: Subscription;
  D4RmetadataSubscription!: Subscription;
  subInventorySubscription!: Subscription;
  subInvMetadataSubscription!: Subscription;
  getReasonsSubscription!: Subscription
  getReasonsDataSubscription!: Subscription
  locatorsMetaDataSubscription!: Subscription;
  locatorsDataSubscription!: Subscription;
  getGlPeriodsSubscription!: Subscription;
  getGlPeriodsDataSubscription!: Subscription;
  getPurchasingPeriodsSubscription!: Subscription;
  getPurchasingPeriodsDataSubscription!: Subscription;
  lotsMetaDataSubscription!: Subscription;
  lotsDataSubscription!: Subscription;
  serialsMetaDataSubscription!: Subscription;
  serialsDataSubscription!: Subscription;
  constructor(
    private apiService: NodeApiService,
    private navCtrl: NavController,
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private authService: AuthService,
    private sharedService: SharedService
  ) { }

  async ngOnInit() {
    try {
      this.organisation = await this.apiService.getValue('selectedOrg')
      this.isOrgLoaded = true;
    } catch (error) {
      this.uiProviderService.presentAlert('Error', 'No Organisation data available');
      this.navCtrl.navigateRoot('/login');
    }
    try {
      this.defaultOrgId = await this.apiService.getValue('orgId')
    } catch (error) {
      this.uiProviderService.presentAlert('Error', 'No Organisation data available');
      this.navCtrl.navigateRoot('/login');
    }
    try {
      this.responsibilities = await this.apiService.getValue('responsibilities')
    this.isRespLoaded = true;
    } catch (error) {
      this.uiProviderService.presentAlert('Error', 'No Responsibilities data available');
      this.navCtrl.navigateRoot('/login');
    }
   
    await this.createTransactionHistoryTable(transactionTableName);
  }

  async ionViewDidEnter() {
    // await this.getGlPeriodsMetaData();
    // await this.getPurchasingPeriodsMetaData();
    // await this.getReasonsMetaData();
    // await this.getSubInventoryMetaData();
    // await this.getLocatorsMetaData();
    // await this.getLotsMetaData();
    // await this.getSerialsMetaData();
    // await this.getDocsForReceivingMetaData();
    await this.getResponsibilities();
  
  }

  async getResponsibilities() {
    const RESPONSIBILITIES =  [
      { func: this.getGlPeriodsMetaData, name: 'GL Periods', message: ''},
      { func: this.getPurchasingPeriodsMetaData, name: 'Purchasing Periods', message: ''},
      { func: this.getReasonsMetaData, name: 'Reasons', message: ''},
      { func: this.getSubInventoryMetaData, name: 'Sub Inventories', message: ''},
      { func: this.getLocatorsMetaData, name: 'Locators', message: ''},
      { func: this.getDocsForReceivingMetaData, name: 'Docs For Receiving', message: ''},
      { func: this.getLotsMetaData, name: 'Lots', message: ''},
      { func: this.getSerialsMetaData, name: 'Serials', message: ''},
      { func: this.getGlPeriodsData, name: 'GL Periods Data', message: 'insert data'},
      { func: this.getPurchasingPeriodsData, name: 'Purchasing Periods Data', message: 'insert data'},
      { func: this.getReasonsData, name: 'Reasons Data', message: 'insert data'},
      { func: this.getSubInventoryData, name: 'Sub Inventories Data', message: 'insert data'},
      { func: this.getLocatorsData, name: 'Locators Data', message: 'insert data'},
      { func: this.getDocsForReceivingData, name: 'Docs For Receiving Data', message: 'insert data'},
      { func: this.getLotsData, name: 'Lots Data', message: 'insert data'},
      { func: this.getSerialsData, name: 'Serials Data', message: 'insert data'},
    ]

    for (const responsibility of RESPONSIBILITIES) {
      try {
        await responsibility.func.call(this);
      } catch (error) {
        console.log(error)
      } finally{
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    this.navigateToDashboard();
  }

  async getGlPeriodsMetaData() {
    const params = 'metadata'
    this.getGlPeriodsSubscription = this.apiService.fetchAllByUrl(ApiSettings.glPeriodsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            await this.sharedService.createMetaDataTable(resp, glPeriodsTableName)
            const columns = resp.map((obj: any) => obj.name)
            // await this.getGlPeriodsData()
          } catch (error) {
            console.error(error);
          }
        }
      }, error: (error) => {
        console.error(error);
        this.uiProviderService.presentToast('Error', 'failed to get gl periods table', 'danger');
        this.success = false
      }
    })
  }

  async getGlPeriodsData() {
    const params = `${this.defaultOrgId}`;
    this.getGlPeriodsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.glPeriodsUrl + params).subscribe({
      next: async (resp: any) => {
        try {
          const glPeriods = resp.GLPeriods
          await this.sharedService.insertDataToTable(glPeriods, glPeriodsTableName)
        } catch (error) {
          alert('gl periods' +JSON.stringify(error))
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getPurchasingPeriodsMetaData() {
    const params = 'metadata'
    this.getPurchasingPeriodsSubscription = this.apiService.fetchAllByUrl(ApiSettings.purchasingeriodsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            await this.sharedService.createMetaDataTable(resp, purchasingPeriodsTableName)
            await this.getPurchasingPeriodsData()
          } catch (error) {
            console.error(error);
          }
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getPurchasingPeriodsData() {
    const params = `${this.defaultOrgId}`;
    this.getPurchasingPeriodsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.purchasingeriodsUrl + params).subscribe({
      next: async (resp: any) => {
        try {
          const purchasingPeriods = resp.POPeriods
          
          await this.sharedService.insertDataToTable(purchasingPeriods, purchasingPeriodsTableName)
        } catch (error) {
          alert('purchasing periods' + JSON.stringify(error))
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getReasonsMetaData() {
    const params = 'metadata'
    this.getReasonsSubscription = this.apiService.fetchAllByUrl(ApiSettings.reasonsConfigUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            await this.sharedService.createMetaDataTable(resp, getReasonsTableName)
            const columns = resp.map((obj: any) => obj.name)
            await this.getReasonsData()
          } catch (error) {
            console.error(error);
          }
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getReasonsData() {
    this.getReasonsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.reasonsConfigUrl).subscribe({
      next: async (resp: any) => {
        try {
          const reasons = resp.Reasons
          
          await this.sharedService.insertDataToTable(reasons, getReasonsTableName)
        } catch (error) {
          alert('reasons' +JSON.stringify(error))
        }
      },
      error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getDocsForReceivingMetaData() {
    const params = 'metadata'
    this.D4RmetadataSubscription = this.apiService.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            this.loadDocsForReceiving = 'creating Table';
            
            await this.sharedService.createMetaDataTable(resp, docsForReceivingTableName);
            
            this.loadDocsForReceiving = 'Inserting Data';
            await this.getDocsForReceivingData();
          } catch (error) {
            this.loadDocsForReceiving = 'failed to create Table';
            this.uiProviderService.presentToast('Error', 'failed to create Docs For Receiving table', 'danger');
          }
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast('Error', 'No metadata available for Docs For Receiving', 'danger');
        }
      }, error: (err) => {
        console.log(err);
        this.loadDocsForReceiving = 'failed to create Table';
      }
    })
  }

  async getDocsForReceivingData() {
    this.loadDocsForReceivingStatus = true;
    const params = `${this.organisation.InventoryOrgId_PK}/""/""`;
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
      next: async (resp: any) => {
        this.docs = resp.Docs4Receiving.length
        try {
          
          await this.sharedService.insertDataToTableChunks(resp.Docs4Receiving, docsForReceivingTableName)
          await this.apiService.setValue('isDocs4ReceivingTableEmpty', false);
        } catch (error) {
          alert('Docs4Receiving' +JSON.stringify(error))
          this.loadDocsForReceiving = 'failed to create Table';
          this.uiProviderService.presentToast('Error', 'Failed to load Docs4Receiving Table/data', 'danger');
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  async getSubInventoryMetaData() {
    const params = 'metadata'
    this.subInvMetadataSubscription = this.apiService.fetchAllByUrl(ApiSettings.subInventoryUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            this.loadSubInventoryMessage = 'creating Table';
            
            await this.sharedService.createMetaDataTable(resp, subInventoryTableName)
            this.loadSubInventoryMessage = 'Inserting Data';
            
            await this.getSubInventoryData();
            this.loadSubInventoryMessage = 'Sub Inventories created';
          } catch (error) {
            console.log(error);
            alert('sub inventory' +JSON.stringify(error));
            this.uiProviderService.presentToast('Error', 'failed to create sub inventory table', 'danger');
          }
        } else {
          console.log('No metadata available');
        }
        }, error: (err) => {
        console.log(err);
        this.success = false
      },
      complete: () => {
        this.loadSubInventoryStatus = false;
      }
    })
  }

  async getSubInventoryData() {
    const params = `${this.organisation.InventoryOrgId_PK}/""/""`;
    this.subInventorySubscription = this.apiService.fetchAllByUrl(ApiSettings.subInventoryUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            const ActiveSubInventories = resp.ActiveSubInventories;
            
            await this.sharedService.insertDataToTable(ActiveSubInventories, subInventoryTableName);
            this.subInventories = ActiveSubInventories.length;
          } catch (error) {
            alert('sub inventory data' +JSON.stringify(error))
            this.uiProviderService.presentToast('Error', 'failed to create sub inventory table', 'danger');
          }
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast('Error', 'No metadata available for sub inventory', 'danger');
        }
      }, error: (err) => {
        alert('sub inventory data api' +JSON.stringify(err))
        this.uiProviderService.presentToast('Error', 'failed to get data from sub inventory api', 'danger');
        this.success = false
      }
    })
  }

  async getLocatorsMetaData() {
    const params = 'metadata'
    this.locatorsMetaDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.locatorsURL + params).subscribe({
      next: async (resp: any) => {
        try {
          
          await this.sharedService.createMetaDataTable(resp, locatorsTableName)
          await this.getLocatorsData()
        } catch (error) {
          console.log(error)          
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast('Error', 'failed to create locators table', 'danger');
        this.success = false
      }
    })
  }

  async getLocatorsData() {
    const params = `${this.organisation.InventoryOrgId_PK}/${this.authService.lastLoginDate}/""`;
    this.locatorsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.locatorsURL + params).subscribe({
      next: async (resp: any) => {
        try {
          const ActiveLocators = resp.ActiveLocators
        
          await this.sharedService.insertDataToTable(ActiveLocators, locatorsTableName)
        } catch (error) {
          console.log(error)
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast('Error', 'failed to get locators table data', 'danger');
        this.success = false
      }
    })
  }

  async getLotsMetaData() {
    const params = 'metadata'
    this.lotsMetaDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.lotsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            await this.sharedService.createMetaDataTable(resp, lotsTableName)
            
            await this.getLotsData()
          } catch (error) {
            console.log(error)
          }
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast('Error', 'No metadata available for lots', 'danger');
        }
      },
      error: (error) => {
        console.error(error)
        this.success = false
      }
    })
  }

  async getLotsData() {
    const params = `${this.organisation.InventoryOrgId_PK}/""`;
    this.lotsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.lotsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            
            await this.sharedService.insertDataToTableCSV(resp, lotsTableName)
          } catch (error) {
            console.log(error)
          }
        } else {
          console.log('No metadata available');
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast('Error', 'failed to get lots table data', 'danger');
        this.success = false
      }
    })
  }

  async getSerialsMetaData() {
    const params = 'metadata'
    this.serialsMetaDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.serialsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            await this.sharedService.createMetaDataTable(resp, serialsTableName)
           
            await this.getSerialsData()
          } catch (error) {
            console.log(error)
            this.uiProviderService.presentToast('Error', 'failed to create serials table', 'danger');
          }
        } else {
          console.log('No metadata available');
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast('Error', 'failed to get serials table metadata', 'danger');
        this.success = false
      }
    })
  }

  async getSerialsData() {
    const params = `${this.organisation.InventoryOrgId_PK}/""/""/""`;
    this.serialsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.serialsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            
            await this.sharedService.insertDataToTableCSV(resp, serialsTableName)
          } catch (error) {
            console.log(error)
          }
        } else {
          console.log('No metadata available');
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast('Error', 'failed to get serials table data', 'danger');
        this.success = false
      }
    })
  }

  async onSyncAgain() {
    await this.getDocsForReceivingMetaData();
    this.syncAgain = false;
  }



  async createTransactionHistoryTable(table_name: string) {
    let createTransactionHistoryTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (
      id INTEGER PRIMARY KEY,
      PoNumber TEXT,
      tileName TEXT DEFAULT 'Goods Receipt',
      syncStatus DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      quantityReceived INTEGER,
      receiptNumber TEXT,
      message TEXT,
      status TEXT,
      shipLaneNum TEXT,
      VendorId TEXT,
      UOM TEXT,
      PoHeaderId TEXT,
      PoLineLocationId TEXT,
      PoLineId TEXT,
      PoDistributionId TEXT,
      DestinationType TEXT,
      ItemNumber TEXT)`
    await this.sqliteService.createTable(createTransactionHistoryTableQuery, table_name);
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
    this.sqliteService.dropAllTables();
    this.navCtrl.navigateRoot('/login');
  }
  
  ngOnDestroy() {
    if (this.locationsDataSubscription) {
      this.locationsDataSubscription.unsubscribe();
    }
    if (this.docsForReceivingSubscription) {
      this.docsForReceivingSubscription.unsubscribe();
    }
    if (this.D4RmetadataSubscription) {
      this.D4RmetadataSubscription.unsubscribe();
    }
    if (this.subInvMetadataSubscription){
      this.subInvMetadataSubscription.unsubscribe();
    }
  }
}
