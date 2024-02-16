import { Component, OnDestroy, OnInit } from '@angular/core';
import { SqliteService } from 'src/app/providers/sqlite.service';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  docsForReceivingTableName
} from 'src/app/CONSTANTS/CONSTANTS';
import { NodeApiService } from 'src/app/providers/node-api.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
})
export class ItemsPage implements OnInit, OnDestroy {

  doc!: any
  docsForReceiving: any[] = []
  Orders: any[] = []
  activatedRouteSub!: Subscription
  searchText: string = ''

  constructor(
    private sqliteService: SqliteService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private apiService: NodeApiService
  ) { }

  async ngOnInit() {
    
    this.activatedRouteSub = this.activatedRoute.queryParams.subscribe((data)=>{
      this.doc = data['doc'];
    })
    this.doc = await this.apiService.getValue('selectedPo')
    await this.getPoFromDb();
  }

  async getPoFromDb() {
    const query = `SELECT * FROM ${docsForReceivingTableName} 
                    WHERE SourceTypeCode='PO' 
                    And 
                    PoNumber = '${this.doc.PoNumber}'
                    `;
    try {
      const data = await this.sqliteService.executeCustonQuery(query)
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          this.docsForReceiving.push(data.rows.item(i));
        }
        this.Orders = [...this.docsForReceiving]
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.log("could not get data from docs for receiving: ", error);
    }
   
  }

  onSearch(event: any) {
    this.Orders = this.docsForReceiving.filter((order) => {
      return (order.ItemNumber.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1);
    })
  }

  async goToItemDetails(item: any) {
    await this.apiService.setValue('selectedItem', item);
    this.navCtrl.navigateForward('/goods-receipt/item-details', {
      queryParams: {
        item
      }
    });
  }

  ngOnDestroy() {
    if (this.activatedRouteSub) {
      this.activatedRouteSub.unsubscribe();
    }
  }

}
