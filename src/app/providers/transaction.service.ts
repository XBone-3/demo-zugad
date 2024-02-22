import { Injectable } from '@angular/core';
import { ApiSettings, RESPONSIBILITIES, TypeOfApi } from '../CONSTANTS/CONSTANTS';
import { SharedService } from './shared.service';
import { UiProviderService } from './ui-provider.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private sharedService: SharedService,
    private uiProviderService: UiProviderService
  ) { }

  

  async getTransactionalData(defaultOrgId: any, organisation: any): Promise<boolean> {

    const transactionalApiCalls = [
      { api: ApiSettings.DOCS4RECEIVING, name: RESPONSIBILITIES.DOCS4RECEIVING, message: TypeOfApi.METADATA},
      { api: ApiSettings.DOCS4RECEIVING, name: RESPONSIBILITIES.DOCS4RECEIVING, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.UOM, name: RESPONSIBILITIES.UOM, message: TypeOfApi.METADATA},
      { api: ApiSettings.UOM, name: RESPONSIBILITIES.UOM, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.LOTS, name: RESPONSIBILITIES.LOTS, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.SERIALS, name: RESPONSIBILITIES.SERIALS, message: TypeOfApi.GET_DATA},
    ]

    for(const api of transactionalApiCalls) {
      if (api.message == TypeOfApi.METADATA) {
        try {
          const params = 'metadata';
          const tableName = this.sharedService.getTableName(api.name)
          await this.sharedService.fetchTableMetaData(api.api, tableName, params);
        } catch (error) {
          console.error(`Error getting metadata for ${api.name}: `, error);
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else if (api.message == TypeOfApi.GET_DATA) {
        try {
          const params = this.sharedService.generateParams(api.name, defaultOrgId, organisation);
          const tableName = this.sharedService.getTableName(api.name)
          await this.sharedService.fetchTableData(api.api, tableName, params);
        } catch (error) {
          console.error(`Error getting data for ${api.name}: `, error);
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    return new Promise(resolve => resolve(true))
  }
}
