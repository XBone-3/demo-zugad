import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SqliteService } from '../providers/sqlite.service';
import { TableNames } from '../CONSTANTS/CONSTANTS';

@Component({
  selector: 'app-my-resp',
  templateUrl: './my-resp.page.html',
  styleUrls: ['./my-resp.page.scss'],
})
export class MyRespPage implements OnInit {

  loginTableData: any[] = [];

  constructor(
    private navCtrl: NavController,
    private sqliteService: SqliteService
    // private sqlite: SQLite
  ) { 
    this.sqliteService.getDataFromTable(TableNames.LOGIN).then((data)=>{
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          this.loginTableData.push(data.rows.item(i));
        }
      } else {
        console.log('No data');
      }
    }).catch((error)=>{
      console.log(error);
    })
  }

  ngOnInit() {
  }


  onSelect(item: any) {
    console.log("item", item);
  }

}
