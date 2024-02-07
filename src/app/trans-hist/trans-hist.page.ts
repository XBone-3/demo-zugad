import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../providers/sqlite.service';
import { UiProviderService } from '../providers/ui-provider.service';
import { docsForReceivingTableName, transactionTableName } from '../CONSTANTS/CONSTANTS';
import { ChangeDetectorRef } from '@angular/core';
import { NetworkService } from '../providers/network.service';
import { Subscription } from 'rxjs';
import { NodeApiService } from '../providers/node-api.service';
import { ApiSettings } from '../CONSTANTS/api-settings';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-trans-hist',
  templateUrl: './trans-hist.page.html',
  styleUrls: ['./trans-hist.page.scss'],
})
export class TransHistPage implements OnInit {

  transactionData: any[] = [];
  hasConnection: boolean = false;
  networkSubscription!: Subscription;
  offlineItemsToSync: any[] = [];
  userDetails: any;
  selectedOrg: any;
  orgDetails: boolean = false
  useravailable: boolean = false
  postSubscription!: Subscription
  docsForReceivingSubscription!: Subscription;

  constructor(
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private cdr: ChangeDetectorRef,
    private networkService: NetworkService,
    private apiService: NodeApiService
  ) { 
    this.apiService.getValue('loginData').then((val) => {
      this.userDetails = val[0];
      this.useravailable = true
    })
    this.apiService.getValue('selectedOrg').then((val) => {
      this.selectedOrg = val
      this.orgDetails = true
    })
  }

  async ngOnInit() {
    const data = await this.sqliteService.getDataFromTable(transactionTableName)
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          this.transactionData.push(data.rows.item(i));
        }
      } else {
        console.log('No data');
      }
      this.offlineItemsToSync = this.transactionData.filter((item: any) => item.status === 'local');
      
      this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus)=>{
      this.hasConnection = networkStatus;
    })
  }

  syncTransaction(transaction: any) {
    if (this.hasConnection) {
      if (transaction.status === 'local') {
        const transPayload = this.apiService.generatePayloadBody(transaction, this.selectedOrg, this.userDetails, transaction.quantityReceived,1);
        const payload = this.generateFullPayload([transPayload]);
        this.uiProviderService.presentLoading('performing sync...');
        this.apiService.performPost(ApiSettings.createGoodsReceiptUrl, payload).subscribe({
          next: async (resp: any) => {
          const response = resp['Response']
          const header = response[0].RecordStatus === 'S' ? 'Success' : 'Error'
          const message = response[0].RecordStatus === 'S' ? `post performed on ${transaction.PoNumber} ${transaction.ItemNumber} with ${transaction.quantityReceived} ` : `${response[0].Message} for ${transaction.PoNumber} ${transaction.ItemNumber} with ${transaction.quantityReceived}`
          const color = response[0].RecordStatus === 'S' ? 'success' : 'danger'
          this.uiProviderService.presentToast(header, message, color);
          await this.sqliteService.executeCustonQuery(`UPDATE ${transactionTableName} SET status = ?, message = ?, receiptNumber = ? WHERE id = ?`, [response[0].RecordStatus, response[0].Message, response[0].ReceiptNumber, transaction.id]);
          await this.performDeltaSync();
          },
          error: (error) => {
            console.log("error while performing post transaction: ",error)
          },
          complete: () => {
            this.uiProviderService.dismissLoading();
          }
        })
      } else {
        console.log("transaction already synced")
      }
    } else {
      this.uiProviderService.presentToast('error', 'connection lost', 'danger');
    }
  }

  async syncAllAtOnce() {
 
      const transactions = this.offlineItemsToSync.map((transaction: any, index:any) => 
        this.apiService.generatePayloadBody(transaction, this.selectedOrg, this.userDetails, transaction.quantityReceived, index)
      );
      
      const batchPayload = this.generateFullPayload(transactions);
      this.uiProviderService.presentLoading('performing sync...');
      this.postSubscription = this.apiService.performPostWithHeaders(ApiSettings.createGoodsReceiptUrl, batchPayload, this.getHeaders()).subscribe({
        next: async (resp: any) => {
          console.log(resp);
          const response = resp['Response']
          this.offlineItemsToSync.forEach(async (transaction: any) => {
            const matchedTransaction = response.find((res: any) => res.PoLineLocationId === transaction.PoLineLocationId)
            console.log(matchedTransaction)
            if (matchedTransaction && matchedTransaction.RecordStatus === 'S') {
              this.uiProviderService.presentToast('Success', `Success# ${matchedTransaction.ReceiptNumber}`, `post performed on ${transaction.PoNumber} ${transaction.ItemNumber} with ${transaction.quantityReceived}`);
              console.log(matchedTransaction)
              await this.updateTransaction(response, transaction.id);
            }else if (matchedTransaction && matchedTransaction.RecordStatus === 'E') {
              this.uiProviderService.presentToast('Error', matchedTransaction.Message + " for " + transaction.PoNumber + " " + transaction.ItemNumber, 'danger');
              console.log(matchedTransaction)
              await this.updateTransaction(response, transaction.id);
            } else {
              this.uiProviderService.presentToast('Error', 'post failed for ' + transaction.PoNumber + " " + transaction.ItemNumber, 'tertiary');
            }
          })
          await this.performDeltaSync();
        },
        error: (_) => {
          alert("post transaction failed: ")
        },
        complete: () => {
          this.uiProviderService.dismissLoading();
        }
      })
  }

  async updateTransaction(response: any, id: any) {
    let query = `UPDATE ${transactionTableName}
    SET receiptNumber=?, message=?, status=?
    WHERE id = ?;`;
    let payload = [
      response[0].ReceiptNumber, 
      response[0].Message, 
      response[0].RecordStatus,
      id
    ]
    try{
      await this.sqliteService.executeCustonQuery(query, payload)
      this.uiProviderService.presentToast('Success', 'Transaction status updated successfully');
    } catch (error) {
      console.log("error while updating transaction: ",error)
      this.uiProviderService.presentToast('error', 'Transaction not updated to database', 'danger');
    }
  }

  getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Content-Language': 'en-US'
    })
  }

  generateFullPayload(payloads: any) {
    const payloadObj = {
      "Input": {
          "parts": payloads
      }
    }
    return payloadObj
  }

  async deletetransaction(id: number) {
    console.log("deleteLocation", id);
    const res = await this.uiProviderService.presentAlert("Are you sure you want to delete this Location?", "Delete Location")
      if (res) {
        const index = this.transactionData.findIndex((transaction: any) => transaction.id === id);
        
        this.transactionData.splice(index, 1);

        this.cdr.detectChanges();
        await this.sqliteService.executeCustonQuery(`DELETE FROM ${transactionTableName} WHERE id = ?`, [id]);
        this.uiProviderService.presentToast('Success', 'Transaction deleted successfully');
        
      }
  }
  async performDeltaSync() {
    const params = await this.generateParams();
    // const params = `${this.selectedOrg.InventoryOrgId_PK}/""/""`;
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
      next: async (resp: any) => {
          const columns = Object.keys(resp.Docs4Receiving[0])
          try {
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
  }

  async generateParams() {
    const orgId = await this.apiService.getValue('orgId')
    const formattedDate = formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US")
    return `${orgId}/"${formattedDate}"/"N"`
   }
}
