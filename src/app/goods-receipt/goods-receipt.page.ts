import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../providers/sqlite.service';
import { docsForReceivingTableName, PoInterface } from '../CONSTANTS/CONSTANTS';
import { NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';
import { UiProviderService } from '../providers/ui-provider.service';


@Component({
  selector: 'app-goods-receipt',
  templateUrl: './goods-receipt.page.html',
  styleUrls: ['./goods-receipt.page.scss'],
})
export class GoodsReceiptPage implements OnInit {

  doc!: PoInterface;
  docsForReceiving: any[] = [];
  searchText: string = '';
  receipts: any[] = [];
  offset = 0

  constructor(
    private sqliteService: SqliteService,
    private navCtrl: NavController,
    private apiService: NodeApiService,
    private uiProviderService: UiProviderService
  ) { 
    
  }

  ngOnInit() {
    this.paginationData();
  }

  async paginationData() {
    const query = `SELECT * FROM ${docsForReceivingTableName} 
    WHERE PoNumber IS NOT NULL 
    AND 
    PoHeaderId IS NOT NULL
    GROUP BY PoNumber
    LIMIT 10 
    OFFSET ${ this.offset };`
    const paginated_data = await this.sqliteService.executeCustonQuery(query)
    if( paginated_data.rows.length > 0 ){
      for (let i = 0; i < paginated_data.rows.length; i++) {
        this.docsForReceiving.push(paginated_data.rows.item(i));
      }
      this.receipts = [...this.docsForReceiving]
    }
  }
  
  loadMoreData(event: any) {
    this.offset += 10;
    this.paginationData();
    event.target.complete();
  }

  clearSearch() {
    this.searchText = '';
    this.receipts = [...this.docsForReceiving]
  }

  async scan(val: any) {
    if (val) {
      const query = `SELECT * FROM ${docsForReceivingTableName} WHERE PoNumber LIKE '%${this.searchText}%' GROUP BY PoNumber`;
      const data = await this.sqliteService.executeCustonQuery(query)
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          this.docsForReceiving.push(data.rows.item(i));
        }
        this.receipts = [...this.docsForReceiving]
        this.onSearch(val)
      } else {
        console.log('No data');
      }
      
    }
    
  }

  onSearch(event: any) {
    this.receipts = this.docsForReceiving.filter((item) => {
      return (item.PoNumber.toString().toLowerCase().indexOf(this.searchText.toLowerCase()) > -1);
    })
  }

  async goToItems(doc: any) {
    await this.apiService.setValue('selectedPo', doc);
    this.navCtrl.navigateForward('/goods-receipt/items', {
      queryParams: {
        doc
      } 
    });
  }


}
