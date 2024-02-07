import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ApiSettings } from '../CONSTANTS/api-settings';
import { interval } from 'rxjs';
import { SqliteService } from './sqlite.service';
import { formatDate } from '@angular/common';
import { docsForReceivingTableName } from '../CONSTANTS/CONSTANTS';

@Injectable({
  providedIn: 'root'
})
export class NodeApiService {

  node_url: string = "https://testnode.propelapps.com/";
  loginUrl: string = `${this.node_url}EBS/20D/login`;
  getInventoryOrgUrl: string = `${this.node_url}EBS/20D/getInventoryOrganizations/''`;
  getInventoryOrgTablesUrl: string = `${this.node_url}EBS/23A/getInventoryOrganizationsTable/`;
  getLocationsUrl: string = `${this.node_url}EBS/20D/getLocations/"10-JUN-2024 10:10:00"/""`;
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
    private sqliteService: SqliteService
  ) {
    this.storage.create();
    this.storage.set('isAllOrgTableData', false);
    this.performDeltaSync(this.intervalDuration);
   }

   performDeltaSync(intervalDuration: number) {
    interval(intervalDuration).subscribe(async () => {
      const params = await this.generateParams();
      this.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
        next: async (resp: any) => {
          const columns = Object.keys(resp.Docs4Receiving[0])
          try {
        //     await this.sqliteService.dropTable(docsForReceivingTableName);
        // await this.createDocs4ReceivingTable(docsForReceivingTableName, columns);

            await resp.Docs4Receiving.forEach(async (element: any) => {
              if (element.Flag === 'D') {
                await this.sqliteService.executeCustonQuery(`DELETE FROM ${docsForReceivingTableName} WHERE OrderLineId=? AND PoLineLocationId=? AND ShipmentLineId=?`, [element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);
              } else {
                await this.sqliteService.insertData(`INSERT OR REPLACE INTO ${docsForReceivingTableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, Object.values(element));
              }
            })
          } catch (error) {
            console.log('error in performDeltaSync: ', error);
          }
        
        }, error: (err) => {
          console.log('error in performDeltaSync: ', err);
        }
      })
    })
     
  }
   async createDocs4ReceivingTable(table_name: string, columns: any) {
    let createDocs4ReceivingTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (${columns.join(',')})`;
    await this.sqliteService.createTable(createDocs4ReceivingTableQuery, table_name);
  }

   async generateParams() {
    const orgId = await this.getValue('orgId')
    const formattedDate = formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US")
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
    // return a subject
     return this.http.post(this.loginUrl, params);
   }

   performPostWithHeaders(url: string, body: any, headers: any) {
     // return a subject
     return this.http.post(url, body, headers);
   }
   performPost(url: string, body: any) {
     // return a subject
     return this.http.post(url, body);
   }

   fetchAllOrgTables() {
     // return a subject
     return this.http.get(ApiSettings.InventoryOrgUrl, {responseType: 'json'});
   }

   fetchAllOrgTableData(params: any) {
     return this.http.get(`${ApiSettings.InventoryOrgTablesUrl}${params}`, {responseType: 'json'});
   }

   fetchAllByUrl(url: string) {
     return this.http.get(url, {responseType: 'json'});
   }

   generatePayloadBody(payload: any, selectedOrg: any, user: any, quantity: any, id: number ) {
    const payloadObj = {
                  "id": `part${id}`,
                  "path": "/receivingReceiptRequests",
                  "operation": "create",
                  "payload": {
                      "ReceiptSourceCode": "",
                      "OrganizationCode": "",
                      "EmployeeId": user.PERSON_ID,
                      "BusinessUnitId": selectedOrg.BusinessUnitId,
                      "ReceiptNumber": "",
                      "BillOfLading": "",
                      "FreightCarrierName": "",
                      "PackingSlip": "",
                      "WaybillAirbillNumber": "",
                      "ShipmentNumber": "",
                      "ShippedDate": "",
                      "VendorSiteId": "",
                      "VendorId": payload.VendorId,
                      "attachments": [],
                      "CustomerId": "",
                      "InventoryOrgId": selectedOrg.InventoryOrgId_PK,
                      "DeliveryDate": "29-Jan-2024 19:32:44",
                      "ResponsibilityId": "20634",
                      "UserId": user.USER_ID,
                      "DummyReceiptNumber": new Date().getTime(),
                      "BusinessUnit": "Vision Operations",
                      "InsertAndProcessFlag": "true",
                      "lines": [
                          {
                              "ReceiptSourceCode": "",
                              "MobileTransactionId": new Date().getTime(),
                              "TransactionType": "RECEIVE",
                              "AutoTransactCode": "RECEIVE",
                              "OrganizationCode": "",
                              "DocumentNumber": payload.PoNumber,
                              "DocumentLineNumber": "2",
                              "ItemNumber": payload.ItemNumber,
                              "TransactionDate": "29-Jan-2024 19:32:44",
                              "Quantity": quantity,
                              "UnitOfMeasure": "Ea",
                              "SoldtoLegalEntity": "",
                              "SecondaryUnitOfMeasure": "",
                              "ShipmentHeaderId": "",
                              "ItemRevision": "",
                              "POHeaderId": payload.PoHeaderId,
                              "POLineLocationId": payload.PoLineLocationId,
                              "POLineId": payload.PoLineId,
                              "PODistributionId": payload.PoDistributionId,
                              "ReasonName": "",
                              "Comments": "",
                              "ShipmentLineId": "",
                              "transactionAttachments": [],
                              "lotItemLots": [],
                              "serialItemSerials": [],
                              "lotSerialItemLots": [],
                              "ExternalSystemTransactionReference": "Mobile Transaction",
                              "ReceiptAdviceHeaderId": "",
                              "ReceiptAdviceLineId": "",
                              "TransferOrderHeaderId": "",
                              "TransferOrderLineId": "",
                              "PoLineLocationId": payload.PoLineLocationId,
                              "DestinationTypeCode": payload.DestinationType,
                              "Subinventory": "",
                              "Locator": "",
                              "ShipmentNumber": "",
                              "LpnNumber": "",
                              "OrderLineId": ""
                          }
                      ]
                  }
              }
    return payloadObj;
  }
  
}
