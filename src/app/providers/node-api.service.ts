import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ApiSettings, StoredItemnames } from '../CONSTANTS/CONSTANTS';
import { interval } from 'rxjs';
import { SqliteService } from './sqlite.service';
import { formatDate } from '@angular/common';
import { TableNames } from '../CONSTANTS/CONSTANTS';
import { AuthService } from '../login/auth.service';
// import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class NodeApiService {

  // node_url: string = "https://testnode.propelapps.com/";
  // loginUrl: string = `${this.node_url}EBS/20D/login`;
  // getInventoryOrgUrl: string = `${this.node_url}EBS/20D/getInventoryOrganizations/''`;
  // getInventoryOrgTablesUrl: string = `${this.node_url}EBS/23A/getInventoryOrganizationsTable/`;
  // getLocationsUrl: string = `${this.node_url}EBS/20D/getLocations/"10-JUN-2024 10:10:00"/""`;
  // getDocs4ReceivingUrl: string = `${this.node_url}EBS/20D/getDocumentsForReceiving/7963/""/""`;
  private _isLocationsTableEmpty: boolean = true;
  intervalDuration: number = 1000*60*5;

  get isLocationsTableEmpty() {
    return this._isLocationsTableEmpty;
  }

  set isLocationsTableEmpty(value) {
    this._isLocationsTableEmpty = value;
  }

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private sqliteService: SqliteService,
    private authService: AuthService,
    // private sharedService: SharedService
  ) {
    this.storage.create();
    this.storage.set('isAllOrgTableData', false);
    this.performDeltaSync(this.intervalDuration);
   }

   async performDeltaSync(intervalDuration: number) {
    interval(intervalDuration).subscribe(async () => {
      const params = this.generateParams();
      // const organisation = localStorage.getItem(StoredItemnames.SELECTED_ORG);
      // await this.sharedService.performDeltaSync(TableNames.DOCS4RECEIVING, organisation);
      this.fetchAllByUrl(ApiSettings.DOCS4RECEIVING + params).subscribe({
        next: async (resp: any) => {
          if (resp && resp.status === 200) {
            const columns = Object.keys(resp.body.Docs4Receiving[0])
          try {
        //     await this.sqliteService.dropTable(TableNames.DOCS4RECEIVING);
        // await this.createDocs4ReceivingTable(TableNames.DOCS4RECEIVING, columns);

            await resp.body.Docs4Receiving.forEach(async (element: any) => {
              if (element.Flag === 'D') {
                await this.sqliteService.executeCustonQuery(`DELETE FROM ${TableNames.DOCS4RECEIVING} WHERE OrderLineId=? AND PoLineLocationId=? AND ShipmentLineId=?`, [element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);
              } else {
                await this.sqliteService.insertData(`INSERT OR REPLACE INTO ${TableNames.DOCS4RECEIVING} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, Object.values(element));
                const updateQuery = `
                  UPDATE ${TableNames.DOCS4RECEIVING} 
                  SET QtyOrdered = ?, QtyReceived = ?, QtyRemaining = ?
                  WHERE OrderLineId = ?
                  AND PoLineLocationId = ?
                  AND ShipmentLineId = ?;`;

              await this.sqliteService.executeCustonQuery(updateQuery, [element['QtyOrdered'], element['QtyReceived'], element['QtyRemaining'], element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);
              }
            })
            } catch (error) {
              console.log('error in performDeltaSync: ', error);
            }
            this.authService.lastLoginDate = formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US")
        
          } else if (resp && resp.status === 204) {
            console.log('no docs for receiving in delta');
          } else {
            console.log('error in performDeltaSync: ', resp);
          }
          
        }, error: (err) => {
          console.log('error in performDeltaSync: ', err);
        }
      })
    })
     
  }


   generateParams() {
    const orgId = localStorage.getItem('orgId_pk');
    // const formattedDate = formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US")
    const formattedDate = this.authService.lastLoginDate
    return `${orgId}/"${formattedDate}"/"N"`
   }

   async getValue(tokenId: string) {
     return this.storage.get(tokenId)
    }

   async setValue(tokenId: string, token: any) {
     return this.storage.set(tokenId, token)
   }

   async setToken(tokenId: string, token: any) {
     await this.storage.set(tokenId, token);
   }

   async getToken(tokenId: string) {
     return this.storage.get(tokenId);
   }

   async clearStorage() {
     return this.storage.clear();
   }

   fetchLoginData(params: any) {
     return this.http.post(ApiSettings.LOGIN, params);
   }

   performPostWithHeaders(url: string, body: any, headers: any) {
     return this.http.post(url, body, headers);
   }
   performPost(url: string, body: any) {
     return this.http.post(url, body);
   }

   fetchAllOrgTables() {
     return this.http.get(ApiSettings.INVENTORY_ORG, {responseType: 'json'});
   }

   fetchAllOrgTableData(params: any) {
     return this.http.get(`${ApiSettings.INVENTORY_ORG_TABLE}${params}`, {observe: 'response'});
   }

   fetchAllByUrl(url: string) {
     return this.http.get(url, {observe: 'response'});
   }

}
