import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { Subscription } from 'rxjs';
import { SqliteService } from '../providers/sqlite.service';
import { NetworkService } from '../providers/network.service';
import { UiProviderService } from '../providers/ui-provider.service';
import { NodeApiService } from '../providers/node-api.service';
import { SharedService } from '../providers/shared.service';
import { TableNames, ApiSettings, MESSAGES, Color } from '../CONSTANTS/CONSTANTS';


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
  postSubscription!: Subscription
  docsForReceivingSubscription!: Subscription;

  constructor(
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private cdr: ChangeDetectorRef,
    private networkService: NetworkService,
    private apiService: NodeApiService,
    private sharedService: SharedService
  ) { 
    
  }

  async ngOnInit() {
    const users = await this.apiService.getValue('loginData')
    if (users) {
      this.userDetails = users[0]
    }
    this.selectedOrg = await this.apiService.getValue('selectedOrg')
    await this.getTransactionData();
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus)=>{
      this.hasConnection = networkStatus;
    })
  }

  async getTransactionData() {
    const data = await this.sqliteService.getDataFromTable(TableNames.TRANSACTIONS)
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        this.transactionData.push(data.rows.item(i));
      }
    } else {
      console.log('No data');
    }
    this.offlineItemsToSync = this.transactionData.filter((item: any) => item.status === 'local');
    
  }

  onPullRefresh(event: any) {
    setTimeout(() => {
      this.getTransactionData();
      this.cdr.detectChanges();
      event.target.complete();
    }, 2000);

  }

  async syncAllAtOnce() {
    this.uiProviderService.presentToast('Sync Started', 'Performing sync...');
      const batchPayload = await this.generatePayloadsAll();
      console.log('batch payload', batchPayload)
      if (batchPayload === null) {
        this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'No data to sync', Color.SUCCESS);
        return
      }
      this.postSubscription = this.apiService.performPostWithHeaders(ApiSettings.CREATE_GOODS_RECEIPT, batchPayload, this.getHeaders()).subscribe({
        next: async (resp: any) => {
          console.log(resp);
          const response = resp['Response']
          this.offlineItemsToSync.forEach(async (transaction: any) => {
            const matchedTransaction = response.find((res: any) => res.PoLineLocationId === transaction.poLineLocationId)
            console.log(matchedTransaction)
            if (matchedTransaction && matchedTransaction.RecordStatus === 'S') {
              this.uiProviderService.presentToast(`Success# ${matchedTransaction.ReceiptNumber}`, `post performed on ${transaction.poNumber} ${transaction.itemNumber} with ${transaction.quantityReceived}`);
              console.log(matchedTransaction)
              await this.updateTransaction(response, transaction.id);
            }else if (matchedTransaction && matchedTransaction.RecordStatus === 'E') {
              this.uiProviderService.presentToast(MESSAGES.ERROR, matchedTransaction.Message + " for " + transaction.poNumber + " " + transaction.itemNumber, Color.ERROR);
              console.log(matchedTransaction)
              await this.updateTransaction(response, transaction.id);
            } else {
              this.uiProviderService.presentToast(MESSAGES.ERROR, 'post failed for ' + transaction.poNumber + " " + transaction.itemNumber, Color.TERTIARY);
            }
          })
          await this.performDeltaSync();
          this.cdr.detectChanges();
        },
        error: (_) => {
          alert("post transaction failed: ")
        }
      })
  }

  async generatePayloadsAll() {
    try {
      const successTransactions: any[] = [];
      const transactions = await this.sqliteService.getDataFromTable(TableNames.TRANSACTIONS);
      if (transactions.rows.length > 0) {
        for (let i = 0; i < transactions.rows.length; i++) {
          successTransactions.push(transactions.rows.item(i));
        }
      }
      const successLocalTransactions = successTransactions.filter(
        (transaction: any) => transaction.status === 'local'
      );
      console.log('Successful transactions', successLocalTransactions);
      if (successLocalTransactions.length > 0) {
        const payloads = successLocalTransactions.map((transaction: any, index: any) =>
          this.sharedService.buildPayloadFromTransaction(transaction, index, this.selectedOrg, this.userDetails)
        );
        console.log('payloads', payloads);
        const requestBody: any = {
          Input: {
            parts: payloads,
          },
        };
        return requestBody;

      }
      else {
        this.uiProviderService.presentToast(MESSAGES.SUCCESS,'No pending transactions left', Color.WARNING)
        return null
      }
    } catch (error) {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'Error building payload', Color.ERROR);
      console.error('Error fetching or processing transactions:', error);
    }
  }

  async updateTransaction(response: any, id: any) {
    let query = `UPDATE ${TableNames.TRANSACTIONS}
    SET receiptInfo=?, error=?, status=?
    WHERE id = ?;`;
    let payload = [
      response[0].ReceiptNumber, 
      response[0].Message, 
      response[0].RecordStatus,
      id
    ]
    try{
      await this.sqliteService.executeCustonQuery(query, payload)
      this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'Transaction status updated successfully');
    } catch (error) {
      console.error("error while updating transaction: ",error)
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'Transaction not updated to database', Color.ERROR);
    }
  }

  getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
        Accept: 'application/json',
      'Content-Language': 'en-US'
    })
  }


  async deletetransaction(id: number) {
    console.log("deleteLocation", id);
    const res = await this.uiProviderService.presentAlert("Are you sure you want to delete this Location?", "Delete Location")
      if (res) {
        const index = this.transactionData.findIndex((transaction: any) => transaction.id === id);
        
        this.transactionData.splice(index, 1);

        this.cdr.detectChanges();
        await this.sqliteService.executeCustonQuery(`DELETE FROM ${TableNames.TRANSACTIONS} WHERE id = ?`, [id]);
        this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'Transaction deleted successfully');
        
      }
  }
  async performDeltaSync() {
    const params = this.generateParams();
    // const params = `${this.selectedOrg.InventoryOrgId_PK}/""/""`;
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.DOCS4RECEIVING + params).subscribe({
      next: async (resp: any) => {
        this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'transaction started', MESSAGES.SUCCESS);
        if (resp && resp.status === 200) {
          const columns = Object.keys(resp.body.Docs4Receiving[0])
          try {
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
        } else if (resp && resp.status === 204) {
          console.log('no docs for receiving in delta');
          this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'No docs for receiving in delta');
        } else {
          console.error('error in performDeltaSync: ', resp);
        }
          
        }, error: (err) => {
          console.error('error in performDeltaSync: ', err);
        }
      })
  }

  generateParams() {
    const orgId = this.selectedOrg.InventoryOrgId_PK
    const formattedDate = formatDate(new Date(), "dd-MMM-yyyy HH:mm:ss", "en-US")
    return `${orgId}/"${formattedDate}"/"N"`
   }
}
