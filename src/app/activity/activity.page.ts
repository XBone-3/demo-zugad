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
import { Subscription } from 'rxjs';
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
  isOnline: boolean = false;
  docsForReceivingSubscription!: Subscription;
  D4RmetadataSubscription!: Subscription;
  subInventorySubscription!: Subscription;
  subInvMetadataSubscription!: Subscription;
  locatorsMetaDataSubscription!: Subscription;
  locatorsDataSubscription!: Subscription;
  lotsMetaDataSubscription!: Subscription;
  lotsDataSubscription!: Subscription;
  serialsMetaDataSubscription!: Subscription;
  serialsDataSubscription!: Subscription;
  getUomSubscription!: Subscription;
  getUomDataSubscription!: Subscription;
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
      this.navCtrl.navigateRoot('/login');
    }
    try {
      this.defaultOrgId = await this.apiService.getValue('orgId')
    } catch (error) {
      this.uiProviderService.presentAlert(MESSAGES.ERROR, 'No Organisation data available');
      this.navCtrl.navigateRoot('/login');
    }
    try {
      this.responsibilities = await this.apiService.getValue('responsibilities')
    this.isRespLoaded = true;
    } catch (error) {
      this.uiProviderService.presentAlert(MESSAGES.ERROR, 'No Responsibilities data available');
      this.navCtrl.navigateRoot('/login');
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
        console.log(metadata)
        if (metadata) {
          const dataAvailable = await this.transactionService.getTransactionalData(this.defaultOrgId, this.organisation);
          if (dataAvailable) {
            this.navigateToDashboard();
          } else {
            this.syncAgain = true
          }
          // await this.getResponsibilities();
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

  // async masterConfigApiCall() {
  //   const masterApiCalls = [
  //     { api: ApiSettings.GL_PERIODS, name: RESPONSIBILITIES.GL_PERIODS, message: TypeOfApi.METADATA},
  //     { api: ApiSettings.GL_PERIODS, name: RESPONSIBILITIES.GL_PERIODS, message: TypeOfApi.GET_DATA},
  //     { api: ApiSettings.PURCHASING_PERIODS, name: RESPONSIBILITIES.PURCHASING_PERIODS, message: TypeOfApi.METADATA},
  //     { api: ApiSettings.PURCHASING_PERIODS, name: RESPONSIBILITIES.PURCHASING_PERIODS, message: TypeOfApi.GET_DATA},
  //     { api: ApiSettings.REVISIONS, name: RESPONSIBILITIES.REVISIONS, message: TypeOfApi.METADATA},
  //     { api: ApiSettings.REVISIONS, name: RESPONSIBILITIES.REVISIONS, message: TypeOfApi.GET_DATA},
  //     { api: ApiSettings.SUB_INVENTORY, name: RESPONSIBILITIES.SUB_INVENTORY, message: TypeOfApi.METADATA},
  //     { api: ApiSettings.SUB_INVENTORY, name: RESPONSIBILITIES.SUB_INVENTORY, message: TypeOfApi.GET_DATA},
  //     { api: ApiSettings.LOCATORS, name: RESPONSIBILITIES.LOCATORS, message: TypeOfApi.METADATA},
  //     { api: ApiSettings.LOCATORS, name: RESPONSIBILITIES.LOCATORS, message: TypeOfApi.GET_DATA},
  //   ] 

  //   const configApiCalls = [
  //     { api: ApiSettings.REASONS, name: RESPONSIBILITIES.GET_REASONS, message: TypeOfApi.CONFIG},
  //     { api: ApiSettings.REASONS, name: RESPONSIBILITIES.GET_REASONS, message: TypeOfApi.GET_DATA},
  //   ]

  //   for (const api of masterApiCalls) {
  //     if (api.message === TypeOfApi.METADATA) {
  //       try {
  //         const params = 'metadata'
  //         const tableName = this.sharedService.getTableName(api.name)
  //         await this.sharedService.fetchTableMetaData(api.api, tableName, params)
  //       } catch (error) {
  //         console.error(`metadata ${api.name}`, error)
  //       }
  //     } else if (api.message === TypeOfApi.GET_DATA) {
  //       try {
  //         const params = this.sharedService.generateParams(api.name, this.defaultOrgId, this.organisation)
  //         const tableName = this.sharedService.getTableName(api.name)
  //         await this.sharedService.fetchTableData(api.api, tableName, params)
  //       } catch (error) {
  //         console.error(`data ${api.name}`, error)
  //       }
  //     }
  //   }

  //   for (const api of configApiCalls) {
  //     if (api.message === TypeOfApi.CONFIG) {
  //       try {
  //         const params = 'metadata'
  //         const tableName = this.sharedService.getTableName(api.name)
  //         await this.sharedService.fetchTableMetaData(api.api, tableName, params)
  //       } catch (error) {
  //         console.error(`config ${api.name}`, error)
  //       }
  //     } else if (api.message === TypeOfApi.GET_DATA) {
  //       try {
  //         const params = this.sharedService.generateParams(api.name, this.defaultOrgId, this.organisation)
  //         const tableName = this.sharedService.getTableName(api.name)
  //         await this.sharedService.fetchTableData(api.api, tableName, params)
  //       } catch (error) {
  //         console.error(`data ${api.name}`, error)
  //       }
  //     }
  //   }
    
  //   return new Promise((resolve) => {
  //     resolve(true)
  //   })
  // }


  async getResponsibilities() {
    const RESPONSIBILITIES =  [
      { func: this.getDocsForReceivingMetaData, name: 'Docs For Receiving', message: ''},
      { func: this.getUomMetaData, name: 'UOM', message: ''},
      { func: this.getDocsForReceivingData, name: 'Docs For Receiving Data', message: 'insert data'},
      { func: this.getLotsData, name: 'Lots Data', message: 'insert data'},
      { func: this.getSerialsData, name: 'Serials Data', message: 'insert data'},
      { func: this.getUomData, name: 'UOM Data', message: 'insert data'},
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

  async getUomMetaData() {
    const params = 'metadata'
    this.getUomSubscription = this.apiService.fetchAllByUrl(ApiSettings.UOM + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          try {
            this.loadUomMessage = 'Creating table'
            await this.sharedService.createMetaDataTable(resp.body, TableNames.UOM)
          } catch (error) {
            console.error(error);
            this.loadUomMessage = 'Failed to create table'
            // this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to get uom table', Color.ERROR);
            // this.success = false
          }
        } else if (resp && resp.status === 204) {
          this.loadUomMessage = 'No metadata available'
          this.success = false
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for uom', Color.ERROR);
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getUomData() {
    const params = `${this.organisation.InventoryOrgId_PK}/''`;
    this.getUomDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.UOM + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          try {
            this.loadUomMessage = 'Inserting data'
            const uom = resp.body.Items
            await this.sharedService.insertDataToTable(uom, TableNames.UOM)
            this.loadUomMessage = 'Data inserted'
            this.loadUomStatus = false
          } catch (error) {
            alert('uom' + JSON.stringify(error))
            this.loadUomMessage = 'Failed to insert data'
          }
        } else if (resp && resp.status === 204) {
          this.loadUomMessage = 'No metadata available'
          this.success = false
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for uom', Color.ERROR);
        }
       
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getDocsForReceivingMetaData() {
    const params = 'metadata'
    this.D4RmetadataSubscription = this.apiService.fetchAllByUrl(ApiSettings.DOCS4RECEIVING + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          try {
            this.loadDocsForReceiving = 'creating Table';
            
            await this.sharedService.createMetaDataTable(resp.body, TableNames.DOCS4RECEIVING);
            
            
            // await this.getDocsForReceivingData();
          } catch (error) {
            this.loadDocsForReceiving = 'failed to create Table';
            this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to create Docs For Receiving table', Color.ERROR);
          }
        } else if (resp && resp.status === 204) {
          this.loadDocsForReceiving = 'No metadata available';
          this.success = false
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for Docs For Receiving', Color.ERROR);
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
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.DOCS4RECEIVING + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          this.docs = resp.body.Docs4Receiving.length
        try {
          this.loadDocsForReceiving = 'Inserting Data';
          await this.sharedService.insertDataToTableChunks(resp.body.Docs4Receiving, TableNames.DOCS4RECEIVING)
          this.loadDocsForReceiving = 'Data inserted';
          this.loadDocsForReceivingStatus = false
          // await this.apiService.setValue('isDocs4ReceivingTableEmpty', false);
        } catch (error) {
          alert('Docs4Receiving' +JSON.stringify(error))
          this.loadDocsForReceiving = 'failed to create Table';
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Failed to load Docs4Receiving Table/data', Color.ERROR);
        }
        } else if (resp && resp.status === 204) {
          this.loadDocsForReceiving = 'No metadata available';
          this.success = false
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for Docs For Receiving', Color.ERROR);
        }
        
      },
      error: (err) => {
        console.log(err);
      }
    })
  }




  // async getLotsMetaData() {
  //   const params = 'metadata'
  //   this.lotsMetaDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.LOTS + params).subscribe({
  //     next: async (resp: any) => {
  //       if (resp && resp.status === 200) {
          
  //         try {
  //           this.loadLotsMessage = 'Creating Table';
  //           await this.sharedService.createMetaDataTable(resp.body, TableNames.LOTS)
            
  //           // await this.getLotsData()
  //         } catch (error) {
  //           console.log(error)
  //           this.loadLotsMessage = 'Failed to create table'
  //           // this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to create lots table', Color.ERROR);
  //           // this.success = false
  //         }
  //       } else if (resp && resp.status === 204) {
  //         this.loadLotsMessage = 'No metadata available';
  //         this.success = false
  //       } else {
  //         console.log('No metadata available');
  //         this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for lots', Color.ERROR);
  //       }
  //     },
  //     error: (error) => {
  //       console.error(error)
  //       this.success = false
  //     }
  //   })
  // }

  async getLotsData() {
    const params = `${this.organisation.InventoryOrgId_PK}/""`;
    this.lotsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.LOTS + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          try {
            this.loadLotsMessage = 'Creating Table';
            await this.sharedService.createTableDataCSV(TableNames.LOTS, resp.body)
            this.loadLotsMessage = 'Inserting Data';
            await this.sharedService.insertDataToTableCSV(TableNames.LOTS, resp.body)
            this.loadLotsMessage = 'Lots created';
            this.loadLotsStatus = false
          } catch (error) {
            console.log(error)
            this.loadLotsMessage = 'Failed to insert data'
            // this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to get lots table data', Color.ERROR);
            // this.success = false
          }
        } else if (resp && resp.status === 204) {
          this.loadLotsMessage = 'No metadata available';
          this.success = false
        } else {
          console.log('No metadata available');
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for lots', Color.ERROR);
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to get lots table data', Color.ERROR);
        this.success = false
      }
    })
  }

  // async getSerialsMetaData() {
  //   const params = 'metadata'
  //   this.serialsMetaDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.SERIALS + params).subscribe({
  //     next: async (resp: any) => {
  //       if (resp && resp.status === 200) {
  //         try {
  //           this.loadSerialsMessage = 'Creating Table'
  //           await this.sharedService.createMetaDataTable(resp.body, TableNames.SERIALS)
           
  //           // await this.getSerialsData()
  //         } catch (error) {
  //           console.log(error)
  //           this.loadSerialsMessage = 'Failed to create table'
  //           // this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to create serials table', Color.ERROR);
  //         }
  //       } else if (resp && resp.status === 204) {
  //         this.loadSerialsMessage = 'No metadata available';
  //         this.success = false
  //       } 
  //       else {
  //         console.log('No metadata available');
  //         this.uiProviderService.presentToast(MESSAGES.ERROR, 'No metadata available for serials', Color.ERROR);
  //       }
  //     },
  //     error: (error) => {
  //       console.error(error)
  //       this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to get serials table metadata', Color.ERROR);
  //       this.success = false
  //     }
  //   })
  // }

  async getSerialsData() {
    const params = `${this.organisation.InventoryOrgId_PK}/""/""/""`;
    this.serialsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.SERIALS + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          try {
            this.loadSerialsMessage = 'Creating Table'
            await this.sharedService.createTableDataCSV(TableNames.SERIALS, resp.body)
            this.loadSerialsMessage = 'Inserting Data'
            await this.sharedService.insertDataToTableCSV(TableNames.SERIALS, resp.body)
            this.loadSerialsMessage = 'Serials created';
            this.loadSerialsStatus = false
          } catch (error) {
            console.log(error)
            this.loadSerialsMessage = 'Failed to insert data'
            // this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to get serials table data', Color.ERROR);
            // this.success = false
          }
        } else if (resp && resp.status === 204) {
          this.loadSerialsMessage = 'No metadata available';
          this.success = false
        }  else {
          console.log('No metadata available');
        }
      },
      error: (error) => {
        console.error(error)
        this.uiProviderService.presentToast(MESSAGES.ERROR, 'failed to get serials table data', Color.ERROR);
        this.success = false
      }
    })
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



  // async createTransactionHistoryTable(table_name: string) {
  //   let createTransactionHistoryTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT ,
  //     poNumber TEXT,
  //     titleName TEXT,
  //     syncStatus DATETIME,
  //     createdTime DATETIME,
  //     quantityReceived INTEGER,
  //     receiptInfo TEXT,
  //     error TEXT,
  //     status TEXT,
  //     shipLaneNum TEXT,
  //     vendorId TEXT,
  //     unitOfMeasure TEXT,
  //     poHeaderId TEXT,
  //     poLineLocationId TEXT,
  //     poLineId TEXT,
  //     poDistributionId TEXT,
  //     destinationTypeCode TEXT,
  //     itemNumber TEXT,
  //     Subinventory TEXT,
  //     Locator TEXT,
  //     ShipmentNumber TEXT,
  //     LpnNumber TEXT,
  //     OrderLineId TEXT,
  //     SoldtoLegalEntity TEXT,
  //     SecondaryUnitOfMeasure TEXT,
  //     ShipmentHeaderId TEXT,
  //     ItemRevision TEXT,
  //     ReceiptSourceCode TEXT,
  //     MobileTransactionId TEXT,
  //     TransactionType TEXT,
  //     AutoTransactCode TEXT,
  //     OrganizationCode TEXT,
  //     serialNumbers TEXT,
  //     lotQuantity TEXT,
  //     lotCode TEXT
  //     )`
  //   await this.sqliteService.createTable(createTransactionHistoryTableQuery, table_name);
  // }

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
  
  ngOnDestroy() {
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
