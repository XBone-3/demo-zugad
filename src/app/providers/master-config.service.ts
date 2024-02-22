import { Injectable } from '@angular/core';
import { ApiSettings, RESPONSIBILITIES, TypeOfApi } from '../CONSTANTS/CONSTANTS';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class MasterConfigService {
  

  constructor(
    private sharedService: SharedService
  ) { }


  async masterConfigApiCall(defaultOrgId: any, organisation: any): Promise<boolean> {
    const masterApiCalls = [
      { api: ApiSettings.GL_PERIODS, name: RESPONSIBILITIES.GL_PERIODS, message: TypeOfApi.METADATA},
      { api: ApiSettings.GL_PERIODS, name: RESPONSIBILITIES.GL_PERIODS, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.PURCHASING_PERIODS, name: RESPONSIBILITIES.PURCHASING_PERIODS, message: TypeOfApi.METADATA},
      { api: ApiSettings.PURCHASING_PERIODS, name: RESPONSIBILITIES.PURCHASING_PERIODS, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.REVISIONS, name: RESPONSIBILITIES.REVISIONS, message: TypeOfApi.METADATA},
      { api: ApiSettings.REVISIONS, name: RESPONSIBILITIES.REVISIONS, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.SUB_INVENTORY, name: RESPONSIBILITIES.SUB_INVENTORY, message: TypeOfApi.METADATA},
      { api: ApiSettings.SUB_INVENTORY, name: RESPONSIBILITIES.SUB_INVENTORY, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.LOCATORS, name: RESPONSIBILITIES.LOCATORS, message: TypeOfApi.METADATA},
      { api: ApiSettings.LOCATORS, name: RESPONSIBILITIES.LOCATORS, message: TypeOfApi.GET_DATA},
    ] 

    const configApiCalls = [
      { api: ApiSettings.REASONS, name: RESPONSIBILITIES.GET_REASONS, message: TypeOfApi.CONFIG},
      { api: ApiSettings.REASONS, name: RESPONSIBILITIES.GET_REASONS, message: TypeOfApi.GET_DATA},
    ]

    for (const api of masterApiCalls) {
      if (api.message === TypeOfApi.METADATA) {
        try {
          const params = 'metadata'
          const tableName = this.sharedService.getTableName(api.name)
          await this.sharedService.fetchTableMetaData(api.api, tableName, params)
        } catch (error) {
          console.error(`metadata ${api.name}`, error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } else if (api.message === TypeOfApi.GET_DATA) {
        try {
          const params = this.sharedService.generateParams(api.name, defaultOrgId, organisation)
          const tableName = this.sharedService.getTableName(api.name)
          await this.sharedService.fetchTableData(api.api, tableName, params)
        } catch (error) {
          console.error(`data ${api.name}`, error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }

    for (const api of configApiCalls) {
      if (api.message === TypeOfApi.CONFIG) {
        try {
          const params = 'metadata'
          const tableName = this.sharedService.getTableName(api.name)
          await this.sharedService.fetchTableMetaData(api.api, tableName, params)
        } catch (error) {
          console.error(`config ${api.name}`, error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } else if (api.message === TypeOfApi.GET_DATA) {
        try {
          const params = this.sharedService.generateParams(api.name, defaultOrgId, organisation)
          const tableName = this.sharedService.getTableName(api.name)
          await this.sharedService.fetchTableData(api.api, tableName, params)
        } catch (error) {
          console.error(`data ${api.name}`, error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }
    
    return new Promise((resolve) => {
      resolve(true)
    })
  }


}
