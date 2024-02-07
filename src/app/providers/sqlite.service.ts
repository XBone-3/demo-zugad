import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { loginTableName, locationTableName, historyTableName, userDetailsTableName } from '../CONSTANTS/CONSTANTS';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  db!: SQLiteObject;
  dbConfig = {
    name: 'data.db',
    location: 'default'
  }

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private storage: Storage
  ) { 
    this.platform.ready().then(() => {
      this.sqlite.create(this.dbConfig).then((db: SQLiteObject) => {
        this.db = db;
        console.log('Database Connected');
      }, console.error)
    })
  }

  async createTable(query: string, table_name: string) {
    return this.db.executeSql(query, [])
  }

  async insertData(query: string, data: any) {
    return this.db.executeSql(query, data)
  }
  

  async executeCustonQuery(query: string, data: any = []) {
    return this.db.executeSql(query, data)
  }

  async getDataFromTable(tablename: string) {
    return this.db.executeSql(`SELECT * FROM ${tablename}`, []);
  }

  async getDataFromTablePagination(tablename: string, limit: number, offset: number) {
    return this.db.executeSql(`SELECT * FROM ${tablename} LIMIT ${limit} OFFSET ${offset}`, []);
  }

  async dropTable(table: string) {
    return this.db.executeSql(`DROP TABLE IF EXISTS ${table}`, [])
  }

  async dropAllTables() {
    [loginTableName, locationTableName, historyTableName, userDetailsTableName].forEach(async (table) => {
      await this.db.executeSql(`DROP TABLE ${table}`, []);
    })
  }

  async dropDB() {
    return this.sqlite.deleteDatabase(this.dbConfig)
  }
}
