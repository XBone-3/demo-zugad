import { Injectable } from '@angular/core';
import { UiProviderService } from '../providers/ui-provider.service';
import { NodeApiService } from '../providers/node-api.service';
import { NavController } from '@ionic/angular';
import { SqliteService } from '../providers/sqlite.service';
import { loginTableName } from '../CONSTANTS/CONSTANTS';
import { userDetailsTableName } from '../CONSTANTS/CONSTANTS';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn: boolean = false;
  columns: string[] | undefined;
  isFirstTimeLogin: boolean = true;
  lastLoginDate: string = '';

  constructor(
    private uiProviderService: UiProviderService,
    private apiService: NodeApiService,
    private sqliteService: SqliteService,
    private navCtrl: NavController
  ) { }

  async login(username: string, password: string) {
    if (
      username.trim() === '' || 
      username === null || 
      username === undefined
      ) {
      alert('Please enter username');
      this.uiProviderService.presentToast('Error', 'Please enter username');
      return;
    }
    if (
      password.trim() === '' || 
      password === null || 
      password === undefined
      ) {
      alert('Please enter password');
      this.uiProviderService.presentToast('Error', 'Please enter password');
      return;
    }
    this.uiProviderService.presentLoading('Signing in...');
    let data = {
      username: username,
      password: password
    }
    this.apiService.fetchLoginData(data).subscribe({next: async (res: any) => {
      if (res) {
        if (res?.token) {
          this.apiService.setToken('token', res?.token); 
        }

        let metaData = res.metadata;
        // Create a SQLite 
       
          // Creation of user_details table
          await this.createUserTable();
          // const loginTableName = "login_data";
          let query = `CREATE TABLE IF NOT EXISTS ${loginTableName} (`; 
            query += metaData
              .map((column: any) => `${column.name} ${this.mapToSql(column.type)}`)
              .join(', \n');
            query += ')';
          
          await this.sqliteService.createTable(query, loginTableName); 
        
        // End of Creation of SQLite table
        
        this.columns = [...metaData.map((column: any) => column.name).values()];
        
        let loginData = res.data;
        if (loginData[0].STATUS === "0") {
          this.uiProviderService.presentToast('Error', loginData[0].ERROR, 'danger');
        } else {
          this.isLoggedIn = true;
          let resp = [];
          try {
            const user_name = await this.sqliteService.executeCustonQuery(`SELECT USERNAME FROM ${userDetailsTableName} WHERE USERNAME = '${data.username}'`)
            if (user_name.rows.length > 0) {
              this.isFirstTimeLogin = false;
            }
          } catch (error) {
            console.log("could not get username from db: ", error);
          }

          let default_org_id = "";

          let filteredLoginData = loginData.filter((row: any) => {
            return row.DEFAULT_ORG_ID !== "";
          })

          
          try {
              const baseQuery = `INSERT INTO ${loginTableName} (${this.columns.join(',')}) VALUES {}`;
            const valuesPlaceHolder = Array(filteredLoginData.length).fill(`(${this.columns.map((_) => '?').join(', ')})`).join(',');
            const fullQuery = baseQuery.replace('{}', valuesPlaceHolder);
            const flatData = filteredLoginData.flatMap((row: any) => Object.values(row));
            await this.sqliteService.insertData(fullQuery, flatData);
          } catch (error) {
            console.log("could not insert data into sqlite: ", error);
          }

          for (let i = 0; i<filteredLoginData.length; i++) {
            // Insert data into SQLite table
            
              let responsibility = (filteredLoginData[i].RESPONSIBILITY as string).toLowerCase().trim();
              resp.push(responsibility);
              // try {
              //   if (this.isFirstTimeLogin) {
              //     let query = `INSERT INTO ${loginTableName} (${this.columns.join(',')}) VALUES (${this.columns.map((_) => '?')})`;
              //     await this.sqliteService.insertData(query, Object.values(loginData[i]));
              //   }
              // } catch (error) {
              //   console.log("could not insert data into sqlite: ", error);
              // }
              
              default_org_id = loginData[i].DEFAULT_ORG_ID;
          }
          
          await this.apiService.setValue('orgId', default_org_id);
          await this.apiService.setValue('responsibilities', resp);
          await this.apiService.setValue('loginData', loginData);
          await this.apiService.setValue('username', data.username);
          await this.apiService.setValue('password', data.password);
          
          if (this.isLoggedIn) {
              const login_data = this.apiService.getValue('loginData')
              this.saveLoginData([data.username, data.password]);
              this.lastLoginDate = formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US")
              this.uiProviderService.presentToast('Success', 'Login Successful', 'success');
              this.navCtrl.navigateForward('/select-org', {queryParams: {data: login_data}});
          } else {
            this.uiProviderService.presentToast('Error', 'Login Failed', 'danger');
          }
        } 
      }  
    }, error: (err) => {
      console.log('Login Failed', err);
      this.uiProviderService.presentToast('Error', 'Login Failed');
    }, complete: () => {
      this.uiProviderService.dismissLoading();
    }
  });
    this.uiProviderService.dismissLoading();

  }

  async createUserTable() {
    const query = `CREATE TABLE IF NOT EXISTS ${userDetailsTableName} ( username VARCHAR(255), password VARCHAR(255))`;
    return this.sqliteService.createTable(query, userDetailsTableName);
  }

  async saveLoginData(data: any) {
    const query = `INSERT INTO ${userDetailsTableName} (username, password) VALUES (?, ?)`;
    return this.sqliteService.insertData(query, data);
  }

  mapToSql(type: string) {
    switch (type) {
      case "text":
        return "VARCHAR(255)";
      case "number":
        return "INT";
      default:
        return "VARCHAR(255)";
    }
  }
}
