import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';
import { 
  locationTableName,
  historyTableName, 
  transactionTableName,
  Org,
  docsForReceivingTableName
  } from '../CONSTANTS/CONSTANTS';
import { SqliteService } from '../providers/sqlite.service';
import { ApiSettings } from '../CONSTANTS/api-settings';
import { Subscription } from 'rxjs';
import { UiProviderService } from '../providers/ui-provider.service';


@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit, OnDestroy {

  organisation: Org | any;
  isOrgLoaded: boolean = false;
  loadLocations: string = 'Locations';
  loadLocationStatus: boolean = true;
  loadDocsForReceiving: string = 'Docs For Receiving';
  loadDocsForReceivingStatus: boolean = true;
  responsibilities: any;
  isRespLoaded: boolean = false;
  locationsData: any;
  docsForReceivingColumns: any;
  locations: number = 0
  docs: number = 0
  locationsDataSubscription!: Subscription;
  docsForReceivingSubscription!: Subscription;
  metadataSubscription!: Subscription;
  metadataLoaded: boolean = false;
  syncAgain: boolean = false;
  constructor(
    private apiService: NodeApiService,
    private navCtrl: NavController,
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService
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
      this.responsibilities = await this.apiService.getValue('responsibilities')
    this.isRespLoaded = true;
    } catch (error) {
      this.uiProviderService.presentAlert('Error', 'No Responsibilities data available');
      this.navCtrl.navigateRoot('/login');
    }
    await this.createLocationTable(locationTableName);
    await this.createHistoryTable(historyTableName);
    await this.createTransactionHistoryTable(transactionTableName);
  }

  async ionViewDidEnter() {
    await this.getDataFromLocationsApi();
    // await this.getDocsForReceiving();
    await this.getDocsForReceivingMetaData();
  }

  async getDocsForReceivingMetaData() {
    const params = 'metadata'
    this.metadataSubscription = this.apiService.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          try {
            this.loadDocsForReceiving = 'creating Table';
            const baseQuery = `CREATE TABLE IF NOT EXISTS ${docsForReceivingTableName} ({}, PRIMARY KEY ({}));`;
            const variablesPlaceHolders = resp.map((obj: any) => `${obj.name} ${this.mapTypeToSql(obj.type)}`).join(', ');
            const primarykeyPlaceHolders = resp.filter((obj: any) => obj.primarykey === true).map((obj: any) => obj.name).join(', ');
            this.docsForReceivingColumns = resp.map((obj: any) => obj.name);
            const fullQuery = baseQuery.replace('{}', variablesPlaceHolders).replace('{}', primarykeyPlaceHolders);
            await this.sqliteService.createTable(fullQuery, docsForReceivingTableName);
            this.loadDocsForReceiving = 'Inserting Data';
            await this.getDocsForReceiving();
            this.metadataLoaded = true;
          } catch (error) {
            // alert(JSON.stringify(error))
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
      },
      complete: () => {
        setTimeout(() => {
          if (this.metadataLoaded) {
            this.loadDocsForReceiving = 'Table created Successfully';
            this.navCtrl.navigateForward('/dashboard');
          } else {
            this.syncAgain = true;
          }
          
        }, 1000)
      }
    })
  }

  async onSyncAgain() {
    await this.getDocsForReceivingMetaData();
    this.syncAgain = false;
  }

  mapTypeToSql(type: string) {
    switch (type) {
      case 'string':
        return 'TEXT';
      case 'number':
        return 'INTEGER';
      case 'boolean':
        return 'BOOLEAN';
      default:
        return 'TEXT';
    }
  }

  mapPrimaryKeyToSql(type: boolean) {
    if (type) {
      return 'PRIMARY KEY NOT NULL';
    }
    return '';
  }

  async getDocsForReceiving() {
    this.loadDocsForReceivingStatus = true;
    const params = `${this.organisation.InventoryOrgId_PK}/""/""`;
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
      next: async (resp: any) => {
        // const columns = Object.keys(resp.Docs4Receiving[0]) 
        this.docs = resp.Docs4Receiving.length
        try {
          // await this.sqliteService.dropTable(docsForReceivingTableName);
          // await this.createDocs4ReceivingTable(docsForReceivingTableName, columns);
          const baseQuery = `INSERT OR IGNORE INTO ${docsForReceivingTableName} (${this.docsForReceivingColumns.join(',')}) VALUES {}`;
          // alert(this.docsForReceivingColumns.length + ' ' + Object.values(resp.Docs4Receiving[0]).length)
          const valuesPlaceHolders = Array(this.docs).fill(`(${this.docsForReceivingColumns.map(() => '?').join(',')})`)
          // alert(valuesPlaceHolders + ' ' + valuesPlaceHolders.length)
          const fullQuery = baseQuery.replace('{}', valuesPlaceHolders.join(','));
          const flatDataDocs = resp.Docs4Receiving.flatMap((doc: any) => Object.values(doc));
          // alert(flatDataDocs.length)
          await this.sqliteService.insertData(fullQuery, flatDataDocs);
          await this.apiService.setValue('isDocs4ReceivingTableEmpty', false);
        } catch (error) {
          alert(JSON.stringify(error))
          this.uiProviderService.presentToast('Error', 'Failed to load Docs4Receiving Table/data', 'danger');
        }
        
        // await resp.Docs4Receiving.forEach(async (element: any) => {
        //   await this.sqliteService.insertData(`INSERT OR IGNORE INTO ${docsForReceivingTableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, Object.values(element));
        // })
        
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.loadDocsForReceivingStatus = false;
        setTimeout(() => {
          this.loadDocsForReceiving = 'Table created Successfully';
          this.navCtrl.navigateForward('/dashboard');
        }, 1000)
      }
    })
  }

  async getDataFromLocationsApi() {
      this.loadLocationStatus = true;
      this.locationsDataSubscription = this.apiService.fetchAllByUrl(ApiSettings.LocationsUrl).subscribe({
        next: async (resp: any) => {
          this.locationsData = resp
          this.locations = this.locationsData.LocationList.length
          this.locationsData.LocationList.forEach(async (element: any) => {
            await this.sqliteService.insertData(`INSERT OR IGNORE INTO ${locationTableName} (id, location, lastUpdated) VALUES (?, ?, ?)`, [element.LocationId, element.Location, element.LastUpdateDate]);
          });
          this.apiService.isLocationsTableEmpty = false;
          this.apiService.setValue('isLocationsTableEmpty', false);
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          this.loadLocationStatus = false;
        }
      })
  }

  async createDocs4ReceivingTable(table_name: string, columns: any) {
    let createDocs4ReceivingTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (${columns.join(',')})`;
    await this.sqliteService.createTable(createDocs4ReceivingTableQuery, table_name);
  }

  async createLocationTable(table_name: string) {
    let createLocationTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (id INTEGER PRIMARY KEY, location TEXT, lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP)`;
    await this.sqliteService.createTable(createLocationTableQuery, table_name);
  }

  async createHistoryTable(table_name: string) {
    let createHistoryTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      location TEXT DEFAULT '', 
      lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP, 
      status TEXT)`;
    await this.sqliteService.createTable(createHistoryTableQuery, table_name);
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
    if (this.metadataSubscription) {
      this.metadataSubscription.unsubscribe();
    }
  }
}
