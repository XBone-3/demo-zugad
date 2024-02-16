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
  serialsTableName,
  uomTableName,
  revisionTableName
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
  getUomSubscription!: Subscription;
  getUomDataSubscription!: Subscription;
  getRevisionsSubscription!: Subscription;
  getRevisionsDataSubscription!: Subscription;
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
      // { func: this.getLotsMetaData, name: 'Lots', message: ''},
      // { func: this.getSerialsMetaData, name: 'Serials', message: ''},
      { func: this.getUomMetaData, name: 'UOM', message: ''},
      { func: this.getRevisionsMetaData, name: 'Revisions', message: ''},
      { func: this.getGlPeriodsData, name: 'GL Periods Data', message: 'insert data'},
      { func: this.getPurchasingPeriodsData, name: 'Purchasing Periods Data', message: 'insert data'},
      { func: this.getReasonsData, name: 'Reasons Data', message: 'insert data'},
      { func: this.getSubInventoryData, name: 'Sub Inventories Data', message: 'insert data'},
      { func: this.getLocatorsData, name: 'Locators Data', message: 'insert data'},
      { func: this.getDocsForReceivingData, name: 'Docs For Receiving Data', message: 'insert data'},
      { func: this.getLotsData, name: 'Lots Data', message: 'insert data'},
      { func: this.getSerialsData, name: 'Serials Data', message: 'insert data'},
      { func: this.getUomData, name: 'UOM Data', message: 'insert data'},
      { func: this.getRevisionsData, name: 'Revisions Data', message: 'insert data'},
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
            this.loadGlPeriodsMessage = 'Creating table'
            await this.sharedService.createMetaDataTable(resp, glPeriodsTableName)
            // const columns = resp.map((obj: any) => obj.name)
            // await this.getGlPeriodsData()
            
          } catch (error) {
            this.loadGlPeriodsMessage = 'Failed to create table'
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
          this.loadGlPeriodsMessage = 'Inserting data'
          const glPeriods = resp.GLPeriods
          await this.sharedService.insertDataToTable(glPeriods, glPeriodsTableName)
          this.loadGlPeriodsMessage = 'Data inserted'
          this.loadGlPeriodStatus = false
        } catch (error) {
          alert('gl periods' +JSON.stringify(error))
          this.loadGlPeriodsMessage = 'Failed to insert data'
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getUomMetaData() {
    const params = 'metadata'
    this.getUomSubscription = this.apiService.fetchAllByUrl(ApiSettings.uomUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            this.loadUomMessage = 'Creating table'
            await this.sharedService.createMetaDataTable(resp, uomTableName)
          } catch (error) {
            console.error(error);
            this.loadUomMessage = 'Failed to create table'
            // this.uiProviderService.presentToast('Error', 'failed to get uom table', 'danger');
            // this.success = false
          }
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getUomData() {
    const params = `${this.organisation.InventoryOrgId_PK}/''`;
    this.getUomDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.uomUrl + params).subscribe({
      next: async (resp: any) => {
        try {
          this.loadUomMessage = 'Inserting data'
          const uom = resp.Items
          await this.sharedService.insertDataToTable(uom, uomTableName)
          this.loadUomMessage = 'Data inserted'
          this.loadUomStatus = false
        } catch (error) {
          alert('uom' + JSON.stringify(error))
          this.loadUomMessage = 'Failed to insert data'
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getRevisionsMetaData() {
    const params = 'metadata'
    this.getRevisionsSubscription = this.apiService.fetchAllByUrl(ApiSettings.revisionsUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            this.loadRevisionsMessage = 'Creating table'
            await this.sharedService.createMetaDataTable(resp, revisionTableName)
          } catch (error) {
            console.error(error);
            this.loadRevisionsMessage = 'Failed to create table'
            // this.uiProviderService.presentToast('Error', 'failed to get revisions table', 'danger');
            // this.success = false
          }
        }
      }, error: (error) => {
        console.error(error);
        this.success = false
      }
    })
  }

  async getRevisionsData() {
    const params = `${this.organisation.InventoryOrgId_PK}/''`;
    this.getRevisionsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.revisionsUrl + params).subscribe({
      next: async (resp: any) => {
        try {
          this.loadRevisionsMessage = 'Inserting data'
          const revisions = resp.Items
          await this.sharedService.insertDataToTable(revisions, revisionTableName)
          this.loadRevisionsMessage = 'Data inserted'
          this.loadRevisionsStatus = false
        } catch (error) {
          alert('revisions' + JSON.stringify(error))
          this.loadRevisionsMessage = 'Failed to insert data'
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
            this.loadPurchasingPeriodsMessage = 'Creating table'
            await this.sharedService.createMetaDataTable(resp, purchasingPeriodsTableName)
            // await this.getPurchasingPeriodsData()
          } catch (error) {
            console.error(error);
            this.loadPurchasingPeriodsMessage = 'Failed to create table'
            // this.uiProviderService.presentToast('Error', 'failed to get purchasing periods table', 'danger');
            // this.success = false
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
          this.loadPurchasingPeriodsMessage = 'Inserting data'
          const purchasingPeriods = resp.POPeriods
          
          await this.sharedService.insertDataToTable(purchasingPeriods, purchasingPeriodsTableName)
          this.loadPurchasingPeriodsMessage = 'Data inserted'
          this.loadPurchasingPeriodsStatus = false
        } catch (error) {
          alert('purchasing periods' + JSON.stringify(error))
          this.loadPurchasingPeriodsMessage = 'Failed to insert data'
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
            this.loadReasonsMessage = 'Creating table'
            await this.sharedService.createMetaDataTable(resp, getReasonsTableName)
            // const columns = resp.map((obj: any) => obj.name)
            // await this.getReasonsData()
          } catch (error) {
            console.error(error);
            this.loadReasonsMessage = 'Failed to create table'
            // this.uiProviderService.presentToast('Error', 'failed to get reasons table', 'danger');
            // this.success = false
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
          this.loadReasonsMessage = 'Inserting data'
          const reasons = resp.Reasons
          
          await this.sharedService.insertDataToTable(reasons, getReasonsTableName)
          this.loadReasonsMessage = 'Data inserted'
          this.loadReasonsStatus = false
        } catch (error) {
          alert('reasons' +JSON.stringify(error))
          this.loadReasonsMessage = 'Failed to insert data'
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
            
            
            // await this.getDocsForReceivingData();
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
          this.loadDocsForReceiving = 'Inserting Data';
          await this.sharedService.insertDataToTableChunks(resp.Docs4Receiving, docsForReceivingTableName)
          this.loadDocsForReceiving = 'Data inserted';
          this.loadDocsForReceivingStatus = false
          // await this.apiService.setValue('isDocs4ReceivingTableEmpty', false);
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
            // alert('sub inventory' +JSON.stringify(resp))
            this.loadSubInventoryMessage = 'creating Table';
            
            await this.sharedService.createMetaDataTable(resp, subInventoryTableName)
            
            
            // await this.getSubInventoryData();
            
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
      }
    })
  }

  async getSubInventoryData() {
    const params = `${this.organisation.InventoryOrgId_PK}/""/""`;
    this.subInventorySubscription = this.apiService.fetchAllByUrl(ApiSettings.subInventoryUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            this.loadSubInventoryMessage = 'Inserting Data';
            const ActiveSubInventories = resp.ActiveSubInventories;
            await this.sharedService.insertDataToTable(ActiveSubInventories, subInventoryTableName);
            this.loadSubInventoryMessage = 'Sub Inventories created';
            this.loadSubInventoryStatus = false
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
          this.loadLocatorsMessage = 'Creating Table';
          await this.sharedService.createMetaDataTable(resp, locatorsTableName)
          // await this.getLocatorsData()
        } catch (error) {
          console.log(error) 
          this.loadLocatorsMessage = 'Failed to create table'
          this.uiProviderService.presentToast('Error', 'failed to create locators table', 'danger');         
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
          this.loadLocatorsMessage = 'Inserting Data';
          const ActiveLocators = resp.ActiveLocators
          await this.sharedService.insertDataToTableChunks(ActiveLocators, locatorsTableName)
          this.loadLocatorsMessage = 'Locators created';
          this.loadLocatorsStatus = false
        } catch (error) {
          console.log(error)
          this.loadLocatorsMessage = 'Failed to insert data'
          // this.uiProviderService.presentToast('Error', 'failed to get locators table data', 'danger');
          // this.success = false
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
            this.loadLotsMessage = 'Creating Table';
            await this.sharedService.createMetaDataTable(resp, lotsTableName)
            
            // await this.getLotsData()
          } catch (error) {
            console.log(error)
            this.loadLotsMessage = 'Failed to create table'
            // this.uiProviderService.presentToast('Error', 'failed to create lots table', 'danger');
            // this.success = false
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
            this.loadLotsMessage = 'Creating Table';
            await this.sharedService.createTableDataCSV(lotsTableName, resp)
            this.loadLotsMessage = 'Inserting Data';
            await this.sharedService.insertDataToTableCSV(lotsTableName, resp)
            this.loadLotsMessage = 'Lots created';
            this.loadLotsStatus = false
          } catch (error) {
            console.log(error)
            this.loadLotsMessage = 'Failed to insert data'
            // this.uiProviderService.presentToast('Error', 'failed to get lots table data', 'danger');
            // this.success = false
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
            this.loadSerialsMessage = 'Creating Table'
            await this.sharedService.createMetaDataTable(resp, serialsTableName)
           
            // await this.getSerialsData()
          } catch (error) {
            console.log(error)
            this.loadSerialsMessage = 'Failed to create table'
            // this.uiProviderService.presentToast('Error', 'failed to create serials table', 'danger');
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
            this.loadSerialsMessage = 'Creating Table'
            await this.sharedService.createTableDataCSV(serialsTableName, resp)
            this.loadSerialsMessage = 'Inserting Data'
            await this.sharedService.insertDataToTableCSV(serialsTableName, resp)
            this.loadSerialsMessage = 'Serials created';
            this.loadSerialsStatus = false
          } catch (error) {
            console.log(error)
            this.loadSerialsMessage = 'Failed to insert data'
            // this.uiProviderService.presentToast('Error', 'failed to get serials table data', 'danger');
            // this.success = false
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
      id INTEGER PRIMARY KEY AUTOINCREMENT ,
      poNumber TEXT,
      titleName TEXT,
      syncStatus DATETIME,
      createdTime DATETIME,
      quantityReceived INTEGER,
      receiptInfo TEXT,
      error TEXT,
      status TEXT,
      shipLaneNum TEXT,
      vendorId TEXT,
      unitOfMeasure TEXT,
      poHeaderId TEXT,
      poLineLocationId TEXT,
      poLineId TEXT,
      poDistributionId TEXT,
      destinationTypeCode TEXT,
      itemNumber TEXT,
      Subinventory TEXT,
      Locator TEXT,
      ShipmentNumber TEXT,
      LpnNumber TEXT,
      OrderLineId TEXT,
      SoldtoLegalEntity TEXT,
      SecondaryUnitOfMeasure TEXT,
      ShipmentHeaderId TEXT,
      ItemRevision TEXT,
      ReceiptSourceCode TEXT,
      MobileTransactionId TEXT,
      TransactionType TEXT,
      AutoTransactCode TEXT,
      OrganizationCode TEXT,
      serialNumbers TEXT,
      lotQuantity TEXT,
      lotCode TEXT
      )`
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
    await this.sqliteService.dropAllTables();
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
