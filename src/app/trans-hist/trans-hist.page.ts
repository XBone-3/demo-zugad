import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SqliteService } from '../providers/sqlite.service';
import { NetworkService } from '../providers/network.service';
import { UiProviderService } from '../providers/ui-provider.service';
import { NodeApiService } from '../providers/node-api.service';
import { SharedService } from '../providers/shared.service';
import { TableNames, ApiSettings, MESSAGES, Color, StoredItemnames } from '../CONSTANTS/CONSTANTS';


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
    this.selectedOrg = await this.apiService.getValue(StoredItemnames.SELECTED_ORG)
    await this.getTransactionData();
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus)=>{
      this.hasConnection = networkStatus;
    })
  }

  async getTransactionData() {
    this.transactionData = [];
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
              await this.updateTransaction(matchedTransaction, transaction.id);
            }else if (matchedTransaction && matchedTransaction.RecordStatus === 'E') {
              this.uiProviderService.presentToast(MESSAGES.ERROR, matchedTransaction.Message + " for " + transaction.poNumber + " " + transaction.itemNumber, Color.ERROR);
              console.log(matchedTransaction)
              await this.updateTransaction(matchedTransaction, transaction.id);
            } else {
              this.uiProviderService.presentToast(MESSAGES.ERROR, 'post failed for ' + transaction.poNumber + " " + transaction.itemNumber, Color.TERTIARY);
            }
          })
          await this.sharedService.performDeltaSync(TableNames.DOCS4RECEIVING, this.selectedOrg);
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
      response.ReceiptNumber, 
      response.Message, 
      response.RecordStatus,
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
}
