import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonModal, ModalController, NavParams, ToastController } from '@ionic/angular';
import { TableNames } from '../CONSTANTS/CONSTANTS';
 import { LotListPage } from '../lot-list/lot-list.page';
import { SharedService } from '../providers/shared.service';
import { NodeApiService } from '../providers/node-api.service';


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

  defOrgId: any;
  serialNum: any = "";
  lotCode: string = "";
  sections: FormGroup[] = [];
  totalLotTypedQuantity: number = 0;
  maxTotalQuantity: number = 0;
  selectedOrg: any;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private toastController: ToastController,
    private apiService: NodeApiService
  ) {
    this.receivedItemMsg = this.navParams.get('data');
    this.maxTotalQuantity = this.receivedItemMsg[3];
  }

  async ngOnInit() {
    this.selectedOrg = await this.apiService.getValue('selectedOrg');
    this.defOrgId = this.selectedOrg.InventoryOrgId_PK;
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
        this.loadUomRecords();
        this.templateIdentifier = this.uomTemplate;
      } else if (this.receivedItemMsg[0] == 'SUB-INV') {
        this.loadSubInvRecords();
        this.templateIdentifier = this.subInvTemplate;
      } else if (this.receivedItemMsg[0] == 'LOCATOR') {
        this.loadLocatRecords();
        this.templateIdentifier = this.locTemplate;
      } else if (this.receivedItemMsg[0] == 'LOT-CONTROLLED') {
        this.loadLotControlRecords();
        this.templateIdentifier = this.lotTemplate;
        this.footerTemplateIdentifier = this.lotFooter;
        if (this.receivedItemMsg[5]) {
          alert(JSON.stringify(this.receivedItemMsg[5]))
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
        this.loadSerialRecords();
        this.templateIdentifier = this.serialTemplate;
        this.footerTemplateIdentifier = this.serialFooter;
        if (this.receivedItemMsg[4]) {
          this.serialList = this.receivedItemMsg[4];
        }

      } else if (this.receivedItemMsg[0] == 'REV') {
        this.loadRevisionsRecords();
        this.templateIdentifier = this.revisionTemplate;
      }
    } catch {
      console.error('Error getting modal data');
    }
  }

  async loadUomRecords() {
    try {
      this.commonList = await this.sharedService.getTableData(TableNames.UOM);
    } catch {
      console.error('Error fetching Uom Records');
    }
  }

  async loadLotControlRecords() {
    try {
      this.commonList = await this.sharedService.getCustomTableData(TableNames.LOTS, this.receivedItemMsg[2]?.ItemNumber);
    } catch {
      console.error('Error fetching Lot Records');
    }
  }

  async loadSubInvRecords() {
    try {
      this.refreshSubInvRecords(); // Load all records initially
    } catch (error) {
      console.error('Error fetching Sub Inv Records', error);
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
      this.refreshSubInvRecords();
    }
  }

  async refreshSubInvRecords() {
    try {
      let records = await this.sharedService.getTableData(TableNames.SUB_INVENTORY);
      this.commonList = records.filter(
        (val: any) => val.InventoryOrgId == this.defOrgId
      );
    } catch (error) {
      console.error('Error fetching Sub Inv Records', error);
    }
  }

  onClearSearch(event: any) {
    event.detail.value = "";
    this.refreshSubInvRecords();
  }

  onClearLocSearch(event: any) {
    event.detail.value = "";
    this.refreshLocatorRecords();
  }

  async loadLocatRecords() {
    try {
      this.refreshLocatorRecords();
    } catch {
      console.error('Error fetching Locator Records');
    }
  }

  onSearchLoc(event: any) {
    const searchTerm = event.detail.value;
    if (searchTerm && searchTerm.trim() !== '') {
      this.commonList = this.commonList.filter((val: any) =>
        val.Locator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.refreshLocatorRecords();
    }
  }

  async refreshLocatorRecords() {
    try {
      let locatorsList = await this.sharedService.getTableData(TableNames.LOCATORS);
      this.commonList = locatorsList.filter(
        (val: any) => val.SubInventoryCode == this.receivedItemMsg[1]
      );
    } catch {
      console.error('Error fetching Locator Records');
    }
  }


  async loadSerialRecords() {
    try {
      this.commonList = await this.sharedService.getCustomTableData(TableNames.SERIALS, this.receivedItemMsg[2]?.ItemNumber);
    } catch {
      console.error('Error fetching Serial Records');
    }
  }


  async loadRevisionsRecords() {
    try {
      this.commonList = await this.sharedService.getCustomTableData(TableNames.REVISIONS, this.receivedItemMsg[2]?.ItemNumber);
    } catch {
      console.error('Error fetching Revision Records');
    }
  }
  onModalClose(data: any) {
    if (this.receivedItemMsg[0] == "LOT") {
      if (this.totalLotTypedQuantity != this.maxTotalQuantity) {
        alert('Total Quantity should be one');
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

  serialList: any[] = [];
  onSerialSelect(event: any) {
    let serFilter = this.commonList.filter((val: any) => val.SerialNumber === this.serialNum);
    if (serFilter.length > 0) {
      const serialToAdd = serFilter[0];
      if (!this.serialList.some(serial => serial === serialToAdd.SerialNumber)) {
        if (this.serialList.length < this.receivedItemMsg[3]) {
          this.serialList.push(serialToAdd?.SerialNumber);
          this.serialNum = "";
        } else {
          this.showToastMsg(`Total Quanity should not exceed ${this.receivedItemMsg[3]}`, 'danger');
        }
      } else {
        this.showToastMsg('Serial number is already used', 'danger');
      }
    }
    else {
      //this.showToastMsg(`Invalid Serial Number`, 'danger');
    }
  }

  async onLotSelect() {
    const modal = await this.modalController.create({
      component: LotListPage,
      componentProps: {
        data: [this.receivedItemMsg[2]?.ItemNumber],
      },
    });

    modal.onDidDismiss().then((dataReturned: any) => {
      if (dataReturned.data) {
        let val = dataReturned.data;
        const lastSection = this.sections[this.sections.length - 1];
        lastSection.get('lotCode')?.setValue(val.data);
      }
    });
    return await modal.present();
  }



  deleteSerial(index: number) {
    this.serialList.splice(index, 1);
  }

  goBack() {
    this.modalController.dismiss();
  }

  // logOut() {
  //   this.commonService.showLogoutConfirmation();
  // }

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
        this.showToastMsg('Please fill both Quantity and lot number.', 'danger');
      }
    } else {
      this.showToastMsg(`Total quantity should be ${this.receivedItemMsg[3]}.`, 'danger');
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

  async showToastMsg(message: string, status: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: status
    });
    toast.present();
  }

}
