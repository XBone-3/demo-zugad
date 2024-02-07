import { Component, OnInit } from '@angular/core';
import { HistoryInterface, historyTableName } from 'src/app/CONSTANTS/CONSTANTS';
import { SqliteService } from 'src/app/providers/sqlite.service';
import { UiProviderService } from 'src/app/providers/ui-provider.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  history: HistoryInterface[] = [];

  constructor(
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService
  ) { }

  async ngOnInit() {
    
    try {
      const data = await this.sqliteService.getDataFromTable(historyTableName)
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          this.history.push(data.rows.item(i));
        }
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.log("could not get data from db: ", error);
    }
    
  }

}
