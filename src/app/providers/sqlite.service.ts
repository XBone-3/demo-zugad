import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { loginTableName, locationTableName, historyTableName, userDetailsTableName, docsForReceivingTableName, transactionTableName, lotsTableName, uomTableName, serialsTableName, locatorsTableName, revisionTableName, subInventoryTableName } from '../CONSTANTS/CONSTANTS';

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

  async insertBatchData(query: any, data: any[][]) {
    return this.db.sqlBatch(data.map(row => [query, row]))
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
    // [loginTableName, locationTableName, historyTableName, userDetailsTableName].forEach(async (table) => {
    //   await this.db.executeSql(`DROP TABLE ${table}`, []);
    // })
    const tablesToDrop = [docsForReceivingTableName, transactionTableName, lotsTableName, uomTableName, serialsTableName, locatorsTableName, revisionTableName, subInventoryTableName];
    const dropPromises = tablesToDrop.map((tableName) => {
      const dropQuery = `DROP TABLE IF EXISTS ${tableName}`;
      return this.db.executeSql(dropQuery, []).then(() => {
        console.log(`Table ${tableName} dropped`);
      });
    });

    return Promise.all(dropPromises);
  }

  async dropDB() {
    return this.sqlite.deleteDatabase(this.dbConfig)
  }
}
