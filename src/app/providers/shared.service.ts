import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';
import { UiProviderService } from './ui-provider.service';
import { transactionTableName } from '../CONSTANTS/CONSTANTS';
import { formatDate } from '@angular/common';
import { NodeApiService } from './node-api.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private sqliteService: SqliteService,
    private uiProviderService: UiProviderService,
    private apiService: NodeApiService
  ) {
  }

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

  async insertDataToTableCSV(tableName: string, response: any) {
    try {
      const columns = response[0]
      const data = response.slice(1)
      const valuesPlaceHolders = Array(columns.length).fill('?').join(', ')
      const insertQuery = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${valuesPlaceHolders})`;
      await this.sqliteService.insertBatchData(insertQuery, data)
      // const baseQuery = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES {}`
      // const chunkSize = 50;
      // for (let i = 1; i < response.length; i += chunkSize) {
      //   const chunk = response.slice(i, i + chunkSize);
      //   const valuesPlaceHolders = Array(chunk.length).fill(`(${columns.map(() => '?').join(', ')})`)
      //   const fullQuery = baseQuery.replace('{}', valuesPlaceHolders.join(', '))
        
      //   const flatData = chunk.flatMap((arr: any) => arr)
        
      //   await this.sqliteService.insertData(fullQuery, flatData)
      // }
    } catch (error) {
      alert(`table insertion ${tableName} error: ${JSON.stringify(error)}`)
    }
  }

  async createTableDataCSV(tableName: string, response: any) {
    try {
      const columns = response[0]
      const baseQuery = `CREATE TABLE IF NOT EXISTS ${tableName} ({});`
      const columnDefinitions = columns.map((column: any) => `${column} TEXT`).join(', ')
      const primaryKeyColumns = columns.filter((column: any) => column.endsWith('_PK'))
      const compositePrimaryKey = primaryKeyColumns.length > 0 ? `, PRIMARY KEY (${primaryKeyColumns.join(', ')})` : ''
      const fullQuery = baseQuery.replace('{}', columnDefinitions + compositePrimaryKey)
      await this.sqliteService.createTable(fullQuery, tableName)
    } catch (error) {
      alert(`table creation error: ${JSON.stringify(error)}`)
    }
  }



  insertTransaction(item: any, tableName: string) {
    const query = `INSERT INTO ${tableName} (poNumber, titleName, syncStatus, createdTime, quantityReceived, receiptInfo,error,status,shipLaneNum,
      vendorId,unitOfMeasure,poHeaderId,poLineLocationId,poLineId,poDistributionId,destinationTypeCode,itemNumber,Subinventory,Locator,
      ShipmentNumber,LpnNumber,OrderLineId,SoldtoLegalEntity,SecondaryUnitOfMeasure,ShipmentHeaderId,ItemRevision,ReceiptSourceCode,MobileTransactionId,TransactionType ,
      AutoTransactCode,
      OrganizationCode,serialNumbers,lotQuantity,lotCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const data = [
      item.poNumber,
      item.titleName,
      item.syncStatus,
      item.createdTime.toISOString(),
      item.quantityReceived,
      item.receiptInfo,
      item.error,
      item.status,
      item.shipLaneNum,
      item.vendorId,
      item.unitOfMeasure,
      item.poHeaderId,
      item.poLineLocationId,
      item.poLineId,
      item.poDistributionId,
      item.destinationTypeCode,
      item.itemNumber,
      item.Subinventory,
      item.Locator,
      item.ShipmentNumber,
      item.LpnNumber,
      item.OrderLineId,
      item.SoldtoLegalEntity,
      item.SecondaryUnitOfMeasure,
      item.ShipmentHeaderId,
      item.ItemRevision,
      item.ReceiptSourceCode,
      item.MobileTransactionId,
      item.TransactionType,
      item.AutoTransactCode,
      item.OrganizationCode,
      item.serialNumbers,
      item.lotQuantity,
      item.lotCode
    ];
    return this.sqliteService.insertData(query, data);
  }

  async generatePayloadsAll(selectedOrg: any, userDetails: any) {
    try {
      const transactions = await this.sqliteService.getDataFromTable(transactionTableName);
      const successTransactions = transactions.filter(
        (transaction: any) => transaction.status === 'Local'
      );
      if (successTransactions.length > 0) {
        const payloads = successTransactions.map((transaction: any, index: any) =>
          this.buildPayloadFromTransaction(transaction, index, selectedOrg, userDetails)
        );
        const combinedPayload = this.combinePayloads(payloads);
      }
      else {
        this.uiProviderService.presentToast('Success','No pending transactions left', 'warning')
      }
    } catch (error) {
      console.error('Error fetching or processing transactions:', error);
    }
  }

  buildPayloadFromTransaction(payload: any, index: any, selectedOrg: any, userDetails: any) {
    const requestBody = {
      id: `part${index + 1}`,
      path: '/receivingReceiptRequests',
      operation: 'create',
      payload: {
        ReceiptSourceCode: payload?.ReceiptSourceCode,
        OrganizationCode: payload?.OrganizationCode,
        EmployeeId: userDetails.PERSON_ID,
        BusinessUnitId: selectedOrg?.BusinessUnitId,
        ReceiptNumber: payload?.receiptInfo,
        BillOfLading: '',
        FreightCarrierName: '',
        PackingSlip: '',
        WaybillAirbillNumber: '',
        ShipmentNumber: '',
        ShippedDate: '',
        VendorSiteId: '',
        VendorId: parseInt(payload?.vendorId),
        attachments: [],
        CustomerId: '',
        InventoryOrgId: selectedOrg?.InventoryOrgId_PK,
        DeliveryDate: '31-Jan-2024 12:00:00',
        ResponsibilityId: '20634',
        UserId: localStorage.getItem('USER_ID'),
        DummyReceiptNumber: new Date().getTime(),
        BusinessUnit: 'Vision Operations',
        InsertAndProcessFlag: 'true',
        lines: [
          {
            ReceiptSourceCode: payload?.ReceiptSourceCode,
            MobileTransactionId: new Date().getTime(),
            TransactionType: payload?.TransactionType,
            AutoTransactCode: payload.AutoTransactCode,
            OrganizationCode: payload?.OrganizationCode,
            DocumentNumber: payload?.poNumber,
            DocumentLineNumber: payload?.shipLaneNum,
            ItemNumber: payload?.itemNumber,
            TransactionDate: formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US"),
            Quantity: payload?.quantityReceived,
            UnitOfMeasure: payload?.unitOfMeasure,
            SoldtoLegalEntity: payload?.SoldtoLegalEntity,
            SecondaryUnitOfMeasure: payload?.SecondaryUnitOfMeasure,
            ShipmentHeaderId: payload?.ShipmentHeaderId,
            ItemRevision: payload?.ItemRevision != null ? payload?.ItemRevision : "",
            POHeaderId: parseInt(payload?.poHeaderId),
            POLineLocationId: parseInt(payload?.poLineLocationId),
            POLineId: parseInt(payload?.poLineId),
            PODistributionId: parseInt(payload?.poDistributionId),
            ReasonName: '',
            Comments: '',
            ShipmentLineId: '',
            transactionAttachments: [],
            lotItemLots: (payload?.lotQuantity && payload?.lotQuantity.trim() !== "")
              ? this.buildLotPayload(payload?.lotQuantity, payload?.lotCode)
              : [],
            serialItemSerials: (payload?.serialNumbers && payload?.serialNumbers.trim() !== "")
              ? payload?.serialNumbers.split(',').map((serial: any) => ({
                fromSerial: serial ? serial : "",
                toSerial: serial ? serial : ""
              }))
              : [],
            lotSerialItemLots: [],
            ExternalSystemTransactionReference: 'Mobile Transaction',
            ReceiptAdviceHeaderId: '',
            ReceiptAdviceLineId: '',
            TransferOrderHeaderId: '',
            TransferOrderLineId: '',
            PoLineLocationId: payload?.poLineLocationId,
            DestinationTypeCode: payload?.destinationTypeCode,
            Subinventory: payload?.Subinventory,
            Locator: payload?.Locator,
            ShipmentNumber: payload?.ShipmentNumber,
            LpnNumber: payload?.LpnNumber,
            OrderLineId: payload?.OrderLineId,
          },
        ],
      },
    };
    return requestBody;
  }

  buildLotPayload(lotQuant: any, lotCodes: any) {
    if (lotQuant != "" || lotQuant != null || lotCodes != "" || lotCodes != null) {
      const lotNumbers = lotCodes.split(',');
      const lotQuantities = lotQuant.split(',');
      const resultArray = lotNumbers.map((lotNumber: any, index: any) => ({
        GradeCode: '',
        LotExpirationDate: formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US"),
        LotNumber: lotNumber ? lotNumber : "",
        ParentLotNumber: '',
        SecondaryTransactionQuantity: '',
        TransactionQuantity: lotQuantities[index] ? lotQuantities[index] : "",
      }));
      return resultArray;
    }
    return [];

  }

  combinePayloads(payloads: any[]) {
    const requestBody: any = {
      Input: {
        parts: payloads,
      },
    };

    return requestBody;
  }

  async deleteTransactionById(id: number): Promise<void> {
    try {
      await this.sqliteService.executeCustonQuery('DELETE FROM transactions WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Error deleting record with ID ${id}:`, error);
      throw error;
    }
  }

  async updateTransaction(id: any, statusMsg: any, receiptNum: any, errorMsg: any, tablename: string) {
    try {
      const query = `UPDATE ${tablename} SET status=?,receiptInfo=?,error=? WHERE id=?;`
      const data = [statusMsg, receiptNum, errorMsg, id]
      await this.sqliteService.executeCustonQuery(query, data);
    } catch (error) {
      console.error(`Error updating ${tablename}: `, error);
      throw error;
    }
  }

  async getTableData(tableName: string) {
    const rows = []
    try {
      const data = await this.sqliteService.getDataFromTable(tableName);
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          rows.push(data.rows.item(i));
        }
      }
    } catch (error) {
      console.error(`Error getting data from ${tableName}: `, error);
    }
    return rows
  }

  async getCustomTableData(tableName: string, data: any) {
    const rows = []
    try {
      const query = `SELECT * FROM ${tableName};`
    //  const query = `SELECT * FROM ${tableName};`
      const records = await this.sqliteService.executeCustonQuery(query, []);
      if (records.rows.length > 0) {
        for (let i = 0; i < records.rows.length; i++) {
          rows.push(records.rows.item(i));
        }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error getting data from ${tableName}: `, error);
    }
    return rows
  }

  async getCustomUomTableData(tableName: string, data: any) {
    
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
