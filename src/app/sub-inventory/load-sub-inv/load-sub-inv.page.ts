import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SqliteService } from 'src/app/providers/sqlite.service';
import { NavController } from '@ionic/angular';
import { subInventoryTableName } from 'src/app/CONSTANTS/CONSTANTS';

@Component({
  selector: 'app-load-sub-inv',
  templateUrl: './load-sub-inv.page.html',
  styleUrls: ['./load-sub-inv.page.scss'],
})
export class LoadSubInvPage implements OnInit {

  ActiveSubInventories: any[] = [];
  @Output() selectedInv: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private sqliteService: SqliteService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.getSubInventories();
  }

  async getSubInventories() {
    const subInv = await this.sqliteService.getDataFromTable(subInventoryTableName);
    if (subInv.rows.length > 0) {
      for (let i = 0; i < subInv.rows.length; i++) {
        this.ActiveSubInventories.push(subInv.rows.item(i));
      }
    }
  }

  onSelectInv(inv: any) {
    alert(JSON.stringify(inv))
    this.selectedInv.emit(inv);
    this.navCtrl.navigateBack('/goods-receipt/item-details');
  }

}
