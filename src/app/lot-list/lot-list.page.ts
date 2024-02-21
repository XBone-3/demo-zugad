import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { SharedService } from '../providers/shared.service';
import { TableNames } from '../CONSTANTS/CONSTANTS';

@Component({
  selector: 'app-lot-list',
  templateUrl: './lot-list.page.html',
  styleUrls: ['./lot-list.page.scss'],
})
export class LotListPage implements OnInit {

  lotList: any;
  itemNumber: string = "";
  recivedData: any;
  constructor(
    private sharedService: SharedService,
    private modalController: ModalController,
    private navParams: NavParams
  ) { 
    this.recivedData = this.navParams.get('data');
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadLotControlRecords();
  }
  async loadLotControlRecords() {
    this.itemNumber = this.recivedData[0];
    try {
      this.lotList = await this.sharedService.getCustomTableData(TableNames.LOTS, this.itemNumber);
    } catch {
      console.error('Error fetching Lot Records');
    }
  }
  onModalClose(data: any) {
    this.modalController.dismiss({
      data: data,
    });
  }

}
