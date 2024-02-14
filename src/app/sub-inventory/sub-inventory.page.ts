import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SqliteService } from '../providers/sqlite.service';
import { NodeApiService } from '../providers/node-api.service';
import { NavController } from '@ionic/angular';
import { subInventoryTableName } from '../CONSTANTS/CONSTANTS';

@Component({
  selector: 'app-sub-inventory',
  templateUrl: './sub-inventory.page.html',
  styleUrls: ['./sub-inventory.page.scss'],
})
export class SubInventoryPage implements OnInit {

  @Input() subInvName: string = '';
  ActiveSubInventories: any[] = [];

  constructor(
    private sqliteService: SqliteService,
    private apiService: NodeApiService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    
  }

  goToSubInv() {
    this.navCtrl.navigateForward('sub-inventory/load-sub-inv');
  }

  

}
