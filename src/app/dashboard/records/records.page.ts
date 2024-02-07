import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NodeApiService } from 'src/app/providers/node-api.service';
import { SqliteService } from 'src/app/providers/sqlite.service';
import { UiProviderService } from 'src/app/providers/ui-provider.service';
import { LocationInterface, locationTableName, historyTableName } from 'src/app/CONSTANTS/CONSTANTS';



@Component({
  selector: 'app-records',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss'],
})
export class RecordsPage {

  locationoData: any;
  isConnected: boolean = true;
  offlineMessage: string = "";
  offset: number = 0;
  // isLocationsTableEmpty: boolean = true;

  locations: LocationInterface[] = [];
  location!: LocationInterface;

  constructor(
    private navCtrl: NavController,
    private sqliteService: SqliteService,
    private apiService: NodeApiService,
    private uiProviderService: UiProviderService,
    private cdr: ChangeDetectorRef
  ) {}


  ionViewWillEnter() {
      // this.getDataFromDB();
      this.paginationData();
  
  }

async paginationData() {
  const paginateddata = await this.sqliteService.getDataFromTablePagination(locationTableName, 10, this.offset)
  if( paginateddata.rows.length > 0 ){
    for (let i = 0; i < paginateddata.rows.length; i++) {
      this.locations.push(paginateddata.rows.item(i));
    }
    console.log(this.locations);
  }
  else{
    console.log('No data');
  }
}

loadMoreData(event: any) {
  this.offset += 10;
  console.log("this.offset", this.offset);
  this.paginationData();
  event.target.complete();
}

  async getDataFromDB() {
    this.offlineMessage = "viewing offline";
      try {
        const data = await this.sqliteService.getDataFromTable(locationTableName)
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            this.locations.push(data.rows.item(i));
          }
          await this.apiService.setValue('isLocationsTableEmpty', false);
        } else {
          console.log('No data');
        }
      } catch (error) {
        console.log("could not get data from db: ", error);
      }
  }

  

  onRefresh(){
    this.ionViewWillEnter();
  }

  async insertLocation(loc: LocationInterface, status: string) {
    let query = `INSERT OR IGNORE INTO ${historyTableName} (id, location, lastUpdated, status) VALUES (?, ?, ?, ?)`;
    return this.sqliteService.executeCustonQuery(query, [loc.id, loc.location, new Date(), status]);
  }

  async deleteLocation(id: number) {
    try {
      const res = await this.uiProviderService.presentAlert("Are you sure you want to delete this Location?", "Delete Location")
      if (res) {
        const index = this.locations.findIndex((location) => location.id === id);
        const location = this.locations.find((location) => location.id === id);
        if (location) {
          await this.insertLocation(location!, 'deleted');
        }
        this.locations.splice(index, 1);

        this.cdr.detectChanges();
        this.uiProviderService.presentToast('Success', 'Location deleted successfully');
        this.sqliteService.executeCustonQuery(`DELETE FROM ${locationTableName} WHERE id = ?`, [id]);
      }
    } catch (error) {
      console.log("error while deleting a record: ", error)
    }
  }

  editLocation(id: number) {
    console.log("editLocation", id);
  }

}
