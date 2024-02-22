import { Component, OnInit, OnDestroy } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { NodeApiService } from 'src/app/providers/node-api.service';
import { SqliteService } from 'src/app/providers/sqlite.service';
import { AuthService } from 'src/app/login/auth.service';
import { UiProviderService } from 'src/app/providers/ui-provider.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Color, MESSAGES, TableNames } from 'src/app/CONSTANTS/CONSTANTS';
import { ApiSettings } from 'src/app/CONSTANTS/CONSTANTS';
import { NetworkService } from 'src/app/providers/network.service';
import { SharedService } from 'src/app/providers/shared.service';
import { CommonSharedListPage } from 'src/app/common-shared-list-page/common-shared-list-page.page';

import { formatDate } from '@angular/common';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit, OnDestroy {

  item!: any
  QtyReceiving: any = "";
  subInvName: string = '';
  locator: string = '';
  lot: string = '';
  subInv: any;
  userDetails: any;
  selectedOrg: any;
  orgDetails: boolean = false;
  useravailable: boolean = false;
  enableLot: boolean = false;
  apiResponse: any;
  hasNetwork: boolean = false;
  itemData: any[] = [];
  uomCode: string = '';
  subInvCode: string = '';
  locaCode: string = '';
  itemRevCode: any;
  qtyRecieved: number = 0;
  qtyRemaining: number = 0;
  SerialData: any[] = [];
  convertedLotData: any;
  lotData: any[] = [];
  postitemSubscription!: Subscription;
  networkSubscription!: Subscription;
  activatedSubscription!: Subscription;
  docsForReceivingSubscription!: Subscription;


  constructor(
    private sharedService: SharedService,
    private apiService: NodeApiService,
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private activatedRoute: ActivatedRoute,
    private networkService: NetworkService,
    private modalController: ModalController,
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
    this.loadItemsData();
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

  UpdateQty() {
    if (this.QtyReceiving <= 0) {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'Receipt Quantity can not be zero or empty', Color.ERROR);
      throw new Error;
    }
    else {
      if (this.item.DestinationType == "Inventory") {
        if (this.subInvCode == "" || this.subInvCode == null) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Sub Inventory Code', Color.ERROR);
          throw new Error;
        }
        else if (this.locaCode == "" || this.locaCode == null) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Locator Code', Color.ERROR);
          throw new Error;
        }
      }

      if (this.item.IsSerialControlled == "True") {
        if (this.SerialData.length == 0) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Serial Number', Color.ERROR);
          throw new Error;
        }
      }
      else if (this.item.IsLotControlled == "True") {
        if (this.lotData.length == 0) {
          this.uiProviderService.presentToast(MESSAGES.ERROR,'Please select Lot Number', Color.ERROR);
          throw new Error;
        }
      }
    }


    if (this.QtyReceiving <= this.item.QtyRemaining) {
      this.postTransaction();
    } else {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'QTY Tolerance is Exceeding', Color.ERROR);
    }
  }

  async postTransaction() {
    if (!this.QtyReceiving) {
      this.uiProviderService.presentToast(MESSAGES.ERROR,'Please enter quantity receiving');
      return;
    }
    const generatedPayload = this.buildGoodsReceiptPayload(this.item);
    let transactionPayload = this.transactionObject();
    this.uiProviderService.presentLoading('waiting for response...');
        if (this.hasNetwork) {
          this.postitemSubscription = this.apiService.performPost(ApiSettings.CREATE_GOODS_RECEIPT, generatedPayload).subscribe({next: async (resp: any) => {
              const response = resp['Response']
              
              if (response[0].RecordStatus === 'S') {
                transactionPayload.status = response[0].RecordStatus;
                transactionPayload.receiptInfo = response[0].ReceiptNumber;
                
                this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'Goods receipt created successfully');
                this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.QtyReceiving);
                this.item.QtyReceived = this.item.QtyReceived + parseInt(this.QtyReceiving);
              } else {
                transactionPayload.status = response[0].RecordStatus;
                transactionPayload.error = response[0].Message;
                this.uiProviderService.presentToast(MESSAGES.ERROR, response[0].Message, Color.ERROR);
              }
              
              await this.getDocsForReceivingPost();
            },
            error: (error) => {
              console.error("error while performing post transaction: ", error)
            },
            complete: async () => {
              await this.sharedService.insertTransaction(transactionPayload, TableNames.TRANSACTIONS);
              this.uiProviderService.dismissLoading();
            }
          })
        } else {
          // const offlinePayload = this.transactionObject();
          await this.sharedService.insertTransaction(transactionPayload, TableNames.TRANSACTIONS);
          this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'Goods receipt saved offline');
          this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.QtyReceiving);
          this.item.QtyReceived = this.item.QtyReceived + parseInt(this.QtyReceiving);
          this.uiProviderService.dismissLoading();
        }
      
  }

  transactionObject() {
    const offlinePayload = {
      poNumber: this.item.PoNumber,
      titleName: 'Goods Receipt',
      syncStatus: new Date(),
      createdTime: new Date(),
      quantityReceived: this.QtyReceiving,
      receiptInfo: 'N/A',
      error: '',
      status: 'local',
      shipLaneNum: this.item.PoShipmentNumber,
      vendorId: this.item.VendorId,
      unitOfMeasure: this.item.ItemUom,
      poHeaderId: this.item.PoHeaderId,
      poLineLocationId: this.item.PoLineLocationId,
      poLineId: this.item.PoLineId,
      poDistributionId: this.item.PoDistributionId,
      destinationTypeCode: this.item.DestinationType,
      itemNumber: this.item.ItemNumber,
      Subinventory: this.subInvCode,
      Locator: this.locaCode,
      ShipmentNumber: "",
      LpnNumber: "",
      OrderLineId: "",
      SoldtoLegalEntity: "",
      SecondaryUnitOfMeasure: "",
      ShipmentHeaderId: "",
      ItemRevision: this.itemRevCode,
      ReceiptSourceCode: "",
      MobileTransactionId: "",
      TransactionType: "RECEIVE",
      AutoTransactCode: "DELIVER",
      OrganizationCode: "",
      serialNumbers: this.SerialData.length > 0 ? this.SerialData.join(',') : " ",
      lotQuantity: this.lotData.length > 0 ? this.convertedLotData.map((section: any) => section.TransactionQuantity).join(',') : " ",
      lotCode: this.lotData.length > 0 ? this.convertedLotData.map((section: any) => section.LotNumber).join(',') : " ",
    };
    return offlinePayload;
  }


  async getDocsForReceivingPost() {
    const params = this.generateParams();
    this.docsForReceivingSubscription = this.apiService.fetchAllByUrl(ApiSettings.DOCS4RECEIVING + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          alert(JSON.stringify(resp.body))
          const columns = Object.keys(resp.body.Docs4Receiving[0])
          try {
            await resp.body.Docs4Receiving.forEach(async (element: any) => {
              if (element["Flag"] === 'D') {
                await this.sqliteService.executeCustonQuery(`DELETE FROM ${TableNames.DOCS4RECEIVING} WHERE OrderLineId=? AND PoLineLocationId=? AND ShipmentLineId=?`, [element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);
              } else {
                await this.sqliteService.insertData(`INSERT OR REPLACE INTO ${TableNames.DOCS4RECEIVING} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, Object.values(element));
                const updateQuery = `
                  UPDATE ${TableNames.DOCS4RECEIVING} 
                  SET QtyOrdered = ?, QtyReceived = ?, QtyRemaining = ?
                  WHERE OrderLineId = ?
                  AND PoLineLocationId = ?
                  AND ShipmentLineId = ?;`;

              await this.sqliteService.executeCustonQuery(updateQuery, [element['QtyOrdered'], element['QtyReceived'], element['QtyRemaining'], element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);              }
            })
          } catch (error) {
            console.log('error in performDeltaSync: ', error);
          }
        } else if (resp && resp.status === 204) {
          console.log('no docs for receiving in delta');
          this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'No docs for receiving in delta');
        } else {
          console.log('error in performDeltaSync: ', resp);
        }
        }, error: (err) => {
          console.log('error in performDeltaSync: ', err);
          alert('error in performDeltaSync: ' + JSON.stringify(err));
        }
      })
  }

  generateParams() {
    const orgId = this.selectedOrg.InventoryOrgId_PK
    const formattedDate = this.authService.lastLoginDate
    return `${orgId}/"${formattedDate}"/"N"`
   }

   async loadItemsData() {
    try {
      this.itemData = [this.item];
      this.uomCode = this.itemData[0].ItemUom;
      this.subInvCode = this.itemData[0].DefaultSubInventoryCode;
      this.locaCode = this.itemData[0].DefaultLocator;
      this.itemRevCode = this.itemData[0].ItemRevision;
      this.qtyRecieved = this.itemData[0].QtyOrdered;
      this.itemData[0].QtyRemaining;
      this.qtyRemaining = this.itemData[0].QtyRemaining;
    } catch (error) {
      console.error('Error loading data', error);
    }
  }
   async goToCommonListPage(message: string) {
    let modalData: any[] = [message, this.subInvCode, this.item, this.QtyReceiving, this.SerialData, this.convertedLotData];

    if ((message == 'SERIAL-CONTROLLED' || message == 'LOT-CONTROLLED') && this.QtyReceiving <= 0) {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please enter quantity first', Color.ERROR);
      return;
    }

    const modal = await this.modalController.create({
      component: CommonSharedListPage,
      componentProps: { data: modalData },
    });

    modal.onDidDismiss().then((capturedData: any) => {
      if (capturedData.data) {
        let receivedData = capturedData.data;
        switch (message) {
          case 'UOM':
            this.uomCode = receivedData.data;
            break;
          case 'SUB-INV':
            this.subInvCode = receivedData.data;
            break;
          case 'LOCATOR':
            this.locaCode = receivedData.data;
            break;
          case 'LOT-CONTROLLED':
            this.lotData = receivedData.data;
            if (this.lotData.length > 0) {
              this.buildLotData();
            }
            break;
          case 'SERIAL-CONTROLLED':
            this.SerialData = receivedData.data;
            break;
          case 'REV':
            this.itemRevCode = receivedData.data;
            break;
        }
      }
    });

    await modal.present();
  }
 
  buildLotData() {
    this.convertedLotData = [];
    if (this.lotData) {
      for (const section of this.lotData) {
        const lotQuantity = section.get('lotQuantity').value;
        const lotCode = section.get('lotCode').value;
        const convertedObject = {
          GradeCode: '',
          LotExpirationDate: '',
          LotNumber: lotCode,
          ParentLotNumber: '',
          SecondaryTransactionQuantity: '',
          TransactionQuantity: lotQuantity,
        };
        this.convertedLotData.push(convertedObject);
      }
    }

    return this.convertedLotData;

  }

  buildGoodsReceiptPayload(item: any) {
    const requestBody: any = {
      Input: {
        parts: [
          {
            id: 'part1',
            path: '/receivingReceiptRequests',
            operation: 'create',
            payload: {
              ReceiptSourceCode: item.ReceiptSourceCode,
              OrganizationCode: item.OrganizationCode,
              EmployeeId: this.userDetails.PERSON_ID,
              BusinessUnitId: this.selectedOrg.BusinessUnitId,
              ReceiptNumber: '',
              BillOfLading: item.BillOfLading,
              FreightCarrierName: item.FreightCarrierName,
              PackingSlip: item.Packingslip,
              WaybillAirbillNumber: item.WayBillAirBillNumber,
              ShipmentNumber: item.ShipmentNumber,
              ShippedDate: '',
              VendorSiteId: item.VendorSiteId,
              VendorId: item.VendorId,
              attachments: [],
              CustomerId: item.CustomerId,
              InventoryOrgId: this.selectedOrg.InventoryOrgId_PK,
              DeliveryDate: '31-Jan-2024 12:00:00',
              ResponsibilityId: '20634',
              UserId: this.userDetails.USER_ID,
              DummyReceiptNumber: new Date().getTime(),
              BusinessUnit: 'Vision Operations',
              InsertAndProcessFlag: 'true',
              lines: [
                {
                  ReceiptSourceCode: item.ReceiptSourceCode,
                  MobileTransactionId: new Date().getTime(),
                  TransactionType: 'RECEIVE',
                  AutoTransactCode: 'DELIVER',
                  OrganizationCode: item.OrganizationCode,
                  DocumentNumber: item.PONumber,
                  DocumentLineNumber: item.PoShipmentNumber,
                  ItemNumber: item.ItemNumber,
                  TransactionDate: formatDate(new Date(), 'dd-MMM-yyyy HH:mm:ss', 'en-US'),
                  Quantity: this.QtyReceiving,
                  UnitOfMeasure: this.uomCode,
                  SoldtoLegalEntity: item.SoldtoLegalEntity,
                  SecondaryUnitOfMeasure: '',
                  ShipmentHeaderId: item.ShipmentHeaderId,
                  ItemRevision: this.itemRevCode,
                  POHeaderId: item.POHeaderId,
                  POLineLocationId: item.POLineLocationId,
                  POLineId: item.POLineId,
                  PODistributionId: item.PODistributionId,
                  ReasonName: item.ReasonName,
                  Comments: item.Comments,
                  ShipmentLineId: item.ShipmentLineId,
                  transactionAttachments: [],
                  lotItemLots: this.convertedLotData,
                  serialItemSerials: this.SerialData.map((serial: any) => ({
                    FromSerialNumber: serial,
                    ToSerialNumber: serial
                  })),
                  lotSerialItemLots: [],
                  ExternalSystemTransactionReference: 'Mobile Transaction',
                  ReceiptAdviceHeaderId: item.ReceiptAdviceHeaderId,
                  ReceiptAdviceLineId: item.ReceiptAdviceLineId,
                  TransferOrderHeaderId: item.TransferOrderHeaderId,
                  TransferOrderLineId: item.TransferOrderLineId,
                  PoLineLocationId: item.PoLineLocationId,
                  DestinationTypeCode: item.DestinationType,
                  Subinventory: this.subInvCode,
                  Locator: this.locaCode,
                  ShipmentNumber: item.ShipmentNumber,
                  LpnNumber: item.LpnNumber,
                  OrderLineId: item.OrderLineId,
                },
              ],
            },
          },
        ],
      },
    };
    return requestBody;
  }
  onSubInvEdit() {
    this.subInvCode = "";
    this.locaCode = "";
  }
  onLocatorEdit() {
    this.locaCode = ""
  }

  onQuantityChange(newQuantity: number) {
    this.QtyReceiving = newQuantity;
  }

  onSubInvChange(subInv: any) {
    this.subInvCode = subInv;
  }


  onLocatorChange(locator: any) {
    this.locaCode = locator;
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
    if (this.docsForReceivingSubscription) {
      this.docsForReceivingSubscription.unsubscribe();
    }
  }

}
