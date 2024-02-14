import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SqliteService } from './sqlite.service';
import { UiProviderService } from './ui-provider.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService
  ) { }

  async createMetaDataTable(response: any, tableName: string) {
    let status;
    try {
      const baseQuery = `CREATE TABLE IF NOT EXISTS ${tableName} ({}, PRIMARY KEY ({}));`;
      const columnDefinitions = response.map((obj: any) => `${obj.name} ${this.mapTypeToSql(obj.type)}`).join(', ');
      const primaryKeyColumns = response.filter((obj: any) => obj["primaryKey"] || obj["primarykey"] === true).map((obj: any) => obj["name"]).join(', ');
      const fullQuery = baseQuery.replace('{}', columnDefinitions).replace('{}', primaryKeyColumns);
      await this.sqliteService.createTable(fullQuery, tableName);
      status = true
    } catch (error) {
      this.uiProviderService.presentToast('Error', 'failed to create ' + tableName + ' table', 'danger');
      status = false
    }
    return status
  }

  async insertDataToTable(response: any, tableName: string) {
    try {
      const columns = Object.keys(response[0])
      const baseQuery = `INSERT OR IGNORE INTO ${tableName} (${columns.join(',')}) VALUES {};`;
      const bulkvaluesPlaceHolders = Array(response.length).fill(`(${columns.map(() => '?').join(', ')})`)
      const fullQuery = baseQuery.replace('{}', bulkvaluesPlaceHolders.join(','));
      const bulkData = response.flatMap((obj: any) => Object.values(obj));
      await this.sqliteService.insertData(fullQuery, bulkData);
    } catch (error) {
      throw error
    }
  }

  async insertDataToTableChunks(response: any, tableName: string) {
    try {
      const columns = Object.keys(response[0])
      const baseQuery = `INSERT OR IGNORE INTO ${tableName} (${columns.join(',')}) VALUES {};`;
      const docs_to_insert = response.map((doc: any) => Object.values(doc));
      const chunkSize = 50;
      for (let i = 0; i < docs_to_insert.length; i += chunkSize) {
        const chunk = docs_to_insert.slice(i, i + chunkSize);
        const valuesPlaceHolders = Array(chunk.length).fill(`(${columns.map(() => '?').join(', ')})`).join(', ');
        const fullQuery = baseQuery.replace('{}', valuesPlaceHolders);
        const chunkflatdata = chunk.flatMap((doc: any) => Object.values(doc));
        await this.sqliteService.insertData(fullQuery, chunkflatdata);
      }
    } catch (error) {
      throw error
    }
  }

  async insertDataToTableCSV(response: any, tableName: string) {
    try {
      const columns = response[0]
      const baseQuery = `INSERT OR IGNORE INTO ${tableName} ${columns.join(', ')} VALUES {}`
      const valuesPlaceHolders = Array(response.length-1).fill(`(${columns.map(() => '?').join(', ')})`)
      const fullQuery = baseQuery.replace('{}', valuesPlaceHolders.join(', '))
      const flatLots = response.slice(1, response.length).flatMap((obj: any) => obj)
      await this.sqliteService.insertData(fullQuery, flatLots)
    } catch (error) {
      throw error
    }
  }

  mapTypeToSql(type: string) {
    switch (type) {
      case 'string':
        return 'TEXT';
      case 'number':
        return 'REAL';
      case 'boolean':
        return 'BOOLEAN';
      default:
        return 'TEXT';
    }
  }
}
