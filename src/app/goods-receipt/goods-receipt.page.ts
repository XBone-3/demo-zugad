import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../providers/sqlite.service';
import { docsForReceivingTableName, PoInterface } from '../CONSTANTS/CONSTANTS';
import { NavController } from '@ionic/angular';
import { NodeApiService } from '../providers/node-api.service';


@Component({
  selector: 'app-goods-receipt',
  templateUrl: './goods-receipt.page.html',
  styleUrls: ['./goods-receipt.page.scss'],
})
export class GoodsReceiptPage implements OnInit {

  doc!: PoInterface;
  docsForReceiving: PoInterface[] = [];
  searchText: string = '';
  receipts: any[] = [];
  offset = 0

  constructor(
    private sqliteService: SqliteService,
    private navCtrl: NavController,
    private apiService: NodeApiService
  ) { 
    
  }

  ngOnInit() {
    this.paginationData();
  }

  async paginationData() {
    const query = `SELECT * FROM ${docsForReceivingTableName} 
    WHERE PONUMBER IS NOT NULL 
    AND 
    POHEADERID IS NOT NULL 
    LIMIT 10 
    OFFSET ${ this.offset };`
    const paginated_data = await this.sqliteService.executeCustonQuery(query)
    if( paginated_data.rows.length > 0 ){
      for (let i = 0; i < paginated_data.rows.length; i++) {
        this.doc = {
          PO_NUMBER: paginated_data.rows.item(i).PoNumber,
          PO_TYPE: paginated_data.rows.item(i).PoType,
          VENDOR_NAME: paginated_data.rows.item(i).VendorName,
          LAST_UPDATE_DATE: new Date(paginated_data.rows.item(i).LastUpdateDate),
          REQUESTOR: paginated_data.rows.item(i).Requestor,
          TOTAL: paginated_data.rows.item(i).total
        }
        this.docsForReceiving.push(this.doc);
      }
      this.receipts = [...this.docsForReceiving]
    }
  }
  
  loadMoreData(event: any) {
    this.offset += 10;
    this.paginationData();
    event.target.complete();
  }

  onSearch() {
    console.log(typeof this.searchText);
    this.receipts = this.docsForReceiving.filter((item) => {
      return (item.PO_NUMBER.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1);
    })
  }

  async goToItems(doc: PoInterface) {
    await this.apiService.setValue('selectedPo', doc);
    this.navCtrl.navigateForward('/goods-receipt/items', {
      queryParams: {
        doc
      } 
    });
  }


}
