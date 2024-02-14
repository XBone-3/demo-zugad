import { Component, OnInit, OnDestroy } from '@angular/core';
import { NodeApiService } from 'src/app/providers/node-api.service';
import { SqliteService } from 'src/app/providers/sqlite.service';
import { AuthService } from 'src/app/login/auth.service';
import { UiProviderService } from 'src/app/providers/ui-provider.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { transactionTableName, docsForReceivingTableName } from 'src/app/CONSTANTS/CONSTANTS';
import { ApiSettings } from 'src/app/CONSTANTS/api-settings';
import { NetworkService } from 'src/app/providers/network.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit, OnDestroy {

  item!: any
  private activatedSubscription!: Subscription;
  QtyReceiving: string = '';
  subInvName: string = '';
  locator: string = '';
  lot: string = '';
  subInv: any;
  userDetails: any;
  selectedOrg: any;
  orgDetails: boolean = false;
  useravailable: boolean = false;
  postitemSubscription!: Subscription;
  networkSubscription!: Subscription;
  enableLot: boolean = false;
  apiResponse: any;
  hasNetwork: boolean = false;
  docsForReceivingSubscription!: Subscription;

  constructor(
    private apiService: NodeApiService,
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private activatedRoute: ActivatedRoute,
    private networkService: NetworkService,
    private navCtrl: NavController,
    private authService: AuthService
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
    
    this.activatedSubscription = this.activatedRoute.queryParams.subscribe((data) => {
      this.item = data['item']
      this.subInv = data['inventory']
    })
    this.item = await this.apiService.getValue('selectedItem')
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.hasNetwork = networkStatus
    })

  }

  async ionViewWillEnter() {
    this.activatedSubscription = this.activatedRoute.queryParams.subscribe((data) => {
      this.item = data['item']
      this.subInv = data['inventory']
    })
    this.item = await this.apiService.getValue('selectedItem')
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.hasNetwork = networkStatus
    })
  }

  async insertTransaction(response: any) {
    let query = `INSERT INTO ${transactionTableName} (PoNumber, quantityReceived, receiptNumber, message, status, shipLaneNum, VendorId, UOM, PoHeaderId, PoLineLocationId, PoLineId, PoDistributionId, DestinationType,ItemNumber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let payload = [
      this.item.PoNumber,
      this.QtyReceiving, 
      response[0].ReceiptNumber, 
      response[0].Message, 
      response[0].RecordStatus, 
      this.item.PoShipmentNumber, 
      this.item.VendorId, 
      this.item.ItemUom, 
      this.item.PoHeaderId, 
      this.item.PoLineLocationId, 
      this.item.PoLineId, 
      this.item.PoDistributionId, 
      this.item.DestinationType, 
      this.item.ItemNumber
    ]
    try{
      await this.sqliteService.executeCustonQuery(query, payload)
      this.uiProviderService.presentToast('Success', 'Transaction saved to database');
    } catch (error) {
      console.log("error while inserting transaction: ",error)
      this.uiProviderService.presentToast('error', 'Transaction not saved to database', 'danger');
    }
  }

  async postTransaction() {
    if (!this.QtyReceiving) {
      this.uiProviderService.presentToast('error','Please enter quantity receiving');
      return;
    }
    const transPayload = this.apiService.generatePayloadBody(this.item, this.selectedOrg, this.userDetails, this.QtyReceiving,1);
    const payload = this.generateFullPayload([transPayload]);
    this.uiProviderService.presentLoading('waiting for response...');
        if (this.hasNetwork) {
          this.postitemSubscription = this.apiService.performPost(ApiSettings.createGoodsReceiptUrl, payload).subscribe({next: async (resp: any) => {
              const response = resp['Response']
              await this.insertTransaction(response);
              if (response[0].RecordStatus === 'S') {
                this.uiProviderService.presentToast('Success', 'Goods receipt created successfully');
                this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.QtyReceiving);
                this.item.QtyReceived = this.item.QtyReceived + parseInt(this.QtyReceiving);
              }
              else {
                this.uiProviderService.presentToast('Error', response[0].Message, 'danger');
              }
              await this.getDocsForReceiving();
            },
            error: (error) => {
              console.log("error while performing post transaction: ",error)
            },
            complete: () => {
              this.uiProviderService.dismissLoading();
            }
          })
        } else {
          const responseStructure = [{
            ReceiptNumber:'', 
            TransactionId: '', 
            Message: 'Network not available', 
            RecordStatus: 'local'
          }]
          await this.insertTransaction(responseStructure);
          this.uiProviderService.presentToast('Success', 'Goods receipt saved offline');
          this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.QtyReceiving);
          this.item.QtyReceived = this.item.QtyReceived + parseInt(this.QtyReceiving);
          this.uiProviderService.dismissLoading();
        }
      
  }

  generateFullPayload(payloads: any[]) {
    const payloadObj = {
      "Input": {
          "parts": payloads
      }
    }
    return payloadObj
  }

  async getDocsForReceiving() {
    const params = await this.generateParams();
    // const params = `${this.selectedOrg.InventoryOrgId_PK}/""/""`;
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.Docs4ReceivingUrl + params).subscribe({
      next: async (resp: any) => {
        if (resp) {
          
          const columns = Object.keys(resp.Docs4Receiving[0])
          try {
            await resp.Docs4Receiving.forEach(async (element: any) => {
              if (element["Flag"] === 'D') {
                await this.sqliteService.executeCustonQuery(`DELETE FROM ${docsForReceivingTableName} WHERE OrderLineId=? AND PoLineLocationId=? AND ShipmentLineId=?`, [element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);
              } else {
                await this.sqliteService.insertData(`INSERT OR REPLACE INTO ${docsForReceivingTableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, Object.values(element));
              }
            })
          } catch (error) {
            console.log('error in performDeltaSync: ', error);
          }
        } else {
          alert(JSON.stringify(resp))
          console.log('error in performDeltaSync: ', resp);
        }
        }, error: (err) => {
          console.log('error in performDeltaSync: ', err);
        }
      })
  }

  async generateParams() {
    const orgId = await this.apiService.getValue('orgId')
    // const formattedDate = formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US")
    const formattedDate = this.authService.lastLoginDate
    return `${orgId}/"${formattedDate}"/"N"`
   }

  fetchSubInv(inv: any) {
    alert(JSON.stringify(inv))
  }

  async fetchSubLoc() {

  }

  ngOnDestroy() {
    if (this.activatedSubscription) {
      this.activatedSubscription.unsubscribe();
    }
    if (this.postitemSubscription) {
      this.postitemSubscription.unsubscribe();
    }
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }

}
