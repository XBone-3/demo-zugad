import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../providers/sqlite.service';
import { Color, MESSAGES, TableNames } from '../CONSTANTS/CONSTANTS';
import { NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';
import { UiProviderService } from '../providers/ui-provider.service';


@Component({
  selector: 'app-goods-receipt',
  templateUrl: './goods-receipt.page.html',
  styleUrls: ['./goods-receipt.page.scss'],
})
export class GoodsReceiptPage implements OnInit {


  docsForReceiving: any[] = [];
  searchText: string = '';
  receipts: any[] = [];
  fullDocs: any[] = [];
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
    this.loadFullDocs();
  }

  async paginationData() {
    const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
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
      const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} WHERE PoNumber = '${this.searchText}' GROUP BY PoNumber`;
      const data = await this.sqliteService.executeCustonQuery(query)
      let pos = []
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          pos.push(data.rows.item(i));
        }
        if (pos.length > 0) {
          this.goToItems(pos[0]);
        } else {
          this.uiProviderService.presentToast(MESSAGES.ERROR, `PO Number ${val} not found`, Color.ERROR);
        }
      } else {
        console.log('No data');
        this.uiProviderService.presentToast(MESSAGES.ERROR, `PO Number ${val} not found`, Color.ERROR);
      }
    } else {
      this.uiProviderService.presentToast(MESSAGES.ERROR, `Scanner does not scan a value correctly`, Color.ERROR);
    }
    
  }

  async loadFullDocs() {
    try {
      const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
    WHERE PoNumber IS NOT NULL 
    AND 
    PoHeaderId IS NOT NULL
    GROUP BY PoNumber`;
      const docs = await this.sqliteService.executeCustonQuery(query)
      if (docs.rows.length > 0) {
        for (let i = 0; i < docs.rows.length; i++) {
          this.fullDocs.push(docs.rows.item(i));
        }
      } else {
        console.log('docs for receiving has No data');
      }
    } catch (error) {
      console.error(error)
    }
  }

  onSearch(event: any) {
    this.receipts = this.fullDocs.filter((item) => {
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
