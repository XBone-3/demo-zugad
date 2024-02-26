import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Color, MESSAGES, TableNames } from '../CONSTANTS/CONSTANTS';
 import { LotListPage } from '../lot-list/lot-list.page';
import { SharedService } from '../providers/shared.service';
import { NodeApiService } from '../providers/node-api.service';
import { UiProviderService } from '../providers/ui-provider.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-common-shared-list-page',
  templateUrl: './common-shared-list-page.page.html',
  styleUrls: ['./common-shared-list-page.page.scss'],
})
export class CommonSharedListPage implements OnInit {

  commonList: any;
  LotList: any;
  receivedItemMsg: any;
  templateIdentifier: TemplateRef<any> | null = null;
  footerTemplateIdentifier: TemplateRef<any> | null = null;
  lotNumver: string = "";
  @ViewChild('uomTemplate') uomTemplate!: TemplateRef<any>;
  @ViewChild('lotTemplate') lotTemplate!: TemplateRef<any>;
  @ViewChild('lotFooter') lotFooter!: TemplateRef<any>;
  @ViewChild('locTemplate') locTemplate!: TemplateRef<any>;
  @ViewChild('subInvTemplate') subInvTemplate!: TemplateRef<any>;
  @ViewChild('serialTemplate') serialTemplate!: TemplateRef<any>;
  @ViewChild('serialFooter') serialFooter!: TemplateRef<any>;
  @ViewChild('revisionTemplate') revisionTemplate!: TemplateRef<any>;
  @ViewChild('lotListTemplate') lotListTemplate!: TemplateRef<any>;

  selectedOrgId: any;
  serialNum: any = "";
  lotCode: string = "";
  sections: FormGroup[] = [];
  totalLotTypedQuantity: number = 0;
  maxTotalQuantity: number = 0;
  selectedOrg: any;
  serialList: any[] = [];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private uiProviderService: UiProviderService,
    private apiService: NodeApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.receivedItemMsg = this.navParams.get('data');
    this.maxTotalQuantity = this.receivedItemMsg[3];
  }

  async ngOnInit() {
    this.selectedOrg = await this.apiService.getValue('selectedOrg');
    this.selectedOrgId = this.selectedOrg.InventoryOrgId_PK;
    const section = this.fb.group({
      lotQuantity: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
      lotCode: ['', Validators.required],
    });
    this.sections.push(section);
  }

  ionViewWillEnter() {
    this.getModalMsgData();
  }
  async getModalMsgData() {
    try {
      if (this.receivedItemMsg[0] == 'UOM') {
        try {
          this.commonList = await this.sharedService.getTableData(TableNames.UOM);
        } catch {
          console.error('Error fetching Uom Records');
        }
        this.templateIdentifier = this.uomTemplate;
      } else if (this.receivedItemMsg[0] == 'SUB-INV') {
        try {
          this.subInvRecords();
        } catch (error) {
          console.error('Error fetching Sub Inv Records', error);
        }
        this.templateIdentifier = this.subInvTemplate;
      } else if (this.receivedItemMsg[0] == 'LOCATOR') {
        try {
          this.locatorRecords();
        } catch {
          console.error('Error fetching Locator Records');
        }
        this.templateIdentifier = this.locTemplate;
      } else if (this.receivedItemMsg[0] == 'LOT-CONTROLLED') {
        try {
          this.commonList = await this.sharedService.getCustomTableData(TableNames.LOTS, this.receivedItemMsg[2]?.ItemNumber);
        } catch {
          console.error('Error fetching Lot Records');
        }
        this.templateIdentifier = this.lotTemplate;
        this.footerTemplateIdentifier = this.lotFooter;
        if (this.receivedItemMsg[5]) {
          this.sections.splice(0, 1)
          this.receivedItemMsg[5].forEach((lotItem: any) => {
            const section = this.fb.group({
              lotQuantity: [lotItem.TransactionQuantity, [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
              lotCode: [lotItem.LotNumber, Validators.required],
            });
            this.sections.push(section);
            this.updateTotalQuantity();
          });
        }
      } else if (this.receivedItemMsg[0] == 'SERIAL-CONTROLLED') {
        try {
          this.commonList = await this.sharedService.getCustomTableData(TableNames.SERIALS, this.receivedItemMsg[2]?.ItemNumber);
        } catch {
          console.error('Error fetching Serial Records');
        }
        this.templateIdentifier = this.serialTemplate;
        this.footerTemplateIdentifier = this.serialFooter;
        if (this.receivedItemMsg[4]) {
          this.serialList = this.receivedItemMsg[4];
        }

      } else if (this.receivedItemMsg[0] == 'REV') {
        try {
          this.commonList = await this.sharedService.getCustomTableData(TableNames.REVISIONS, this.receivedItemMsg[2]?.ItemNumber);
        } catch {
          console.error('Error fetching Revision Records');
        }
        this.templateIdentifier = this.revisionTemplate;
      }
    } catch {
      console.error('Error getting modal data');
    }
  }

  onSearch(event: any) {
    const searchTerm = event.detail.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.commonList = this.commonList.filter((val: any) =>
        val.SubInventoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        val.SubInventoryDesc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.subInvRecords();
    }
  }

  async subInvRecords() {
    try {
      let records = await this.sharedService.getTableData(TableNames.SUB_INVENTORY);
      this.commonList = records.filter(
        (val: any) => val.InventoryOrgId == this.selectedOrgId
      );
    } catch (error) {
      console.error('Error fetching Sub Inv Records', error);
    }
  }

  onClearSearch(event: any) {
    event.detail.value = "";
    this.subInvRecords();
  }

  onClearLocSearch(event: any) {
    event.detail.value = "";
    this.locatorRecords();
  }

  onSearchLoc(event: any) {
    const searchTerm = event.detail.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.commonList = this.commonList.filter((val: any) =>
        val.Locator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.locatorRecords();
    }
  }

  async locatorRecords() {
    try {
      let locatorsList = await this.sharedService.getTableData(TableNames.LOCATORS);
      this.commonList = locatorsList.filter(
        (val: any) => val.SubInventoryCode == this.receivedItemMsg[1]
      );
    } catch {
      console.error('Error fetching Locator Records');
    }
  }

  onModalClose(data: any) {
    if (this.receivedItemMsg[0] == "LOT") {
      if (this.totalLotTypedQuantity != this.maxTotalQuantity) {
        alert(`Total Quantity should be ${this.maxTotalQuantity}`);
      }
      else {
        this.modalController.dismiss({
          data: data,
        });
      }
    }
    else {
      this.modalController.dismiss({
        data: data,
      });
    }


  }

  
  onSerialSelect(event: any) {
    let serFilter = this.commonList.filter((val: any) => val.SerialNumber === this.serialNum);
    if (serFilter.length > 0) {
      const serialToAdd = serFilter[0];
      if (!this.serialList.some(serial => serial === serialToAdd.SerialNumber)) {
        if (this.serialList.length < this.receivedItemMsg[3]) {
          this.serialList.push(serialToAdd?.SerialNumber);
          this.serialNum = "";
        } else {
          this.uiProviderService.presentToast(MESSAGES.ERROR, `Total Quanity should not exceed ${this.receivedItemMsg[3]}`, Color.ERROR);
        }
      } else {
        this.uiProviderService.presentToast(MESSAGES.ERROR,'Serial number is already used', Color.ERROR);
      }
    }
    else {
      this.uiProviderService.presentToast(MESSAGES.ERROR,'Serial number not found', Color.ERROR);
    }
  }

  scanSerial(event: any) {
    this.onSerialSelect(event);
    }
  // clearSearch($event: any) {
  // throw new Error('Method not implemented.');
  // }

  async onLotSelect() {
    const modal = await this.modalController.create({
      component: LotListPage,
      componentProps: {
        data: [this.receivedItemMsg[2]?.ItemNumber],
      },
    });

    modal.onDidDismiss().then((dataReturned: any) => {
      if (dataReturned.data) {
        let value = dataReturned.data;
        const lastSection = this.sections[this.sections.length - 1];
        lastSection.get('lotCode')?.setValue(value.data);
      }
    });
    return await modal.present();
  }



  deleteSerial(index: number) {
    this.serialList.splice(index, 1);
    this.cdr.detectChanges();
  }

  goBack() {
    this.modalController.dismiss();
  }


  addSection() {
    if (this.totalLotTypedQuantity < this.maxTotalQuantity) {
      const lastSection = this.sections[this.sections.length - 1];
      if (lastSection.valid) {
        const newSection = this.fb.group({
          lotQuantity: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
          lotCode: ['', Validators.required],
        });
        this.sections.push(newSection);
        this.updateTotalQuantity();
      } else {
        this.uiProviderService.presentToast(MESSAGES.ERROR, 'Quantity and lot number is required.', Color.ERROR);
      }
    } else {
      this.uiProviderService.presentToast(MESSAGES.ERROR, `Total quantity should be ${this.receivedItemMsg[3]}.`, Color.ERROR);
    }
  }

  removeSection(index: number) {
    if (this.sections.length > 1) {
      this.sections.splice(index, 1);
    }
    else {
      const remainingSection = this.sections[0];
      remainingSection.reset();
    }
    this.updateTotalQuantity();
  }



  updateTotalQuantity() {
    this.totalLotTypedQuantity = this.sections.reduce((sum, section) => {
      const lotQuantity = section.get('lotQuantity')?.value || 0;
      return sum + +lotQuantity;
    }, 0);
  }

}
