export const NODE_URL: string = "https://testnode.propelapps.com/";

export class ApiSettings {
    static LOGIN = `${NODE_URL}EBS/20D/login`;
    static INVENTORY_ORG = `${NODE_URL}EBS/20D/getInventoryOrganizations/''`;
    static INVENTORY_ORG_TABLE = `${NODE_URL}EBS/23A/getInventoryOrganizationsTable/`;
    static DOCS4RECEIVING = `${NODE_URL}EBS/20D/getDocumentsForReceiving/`;
    static MOVE_ORDERS = `${NODE_URL}EBS/20D/getMoveOrders/`;
    static CREATE_GOODS_RECEIPT = `${NODE_URL}EBS/20D/createGoodsReceiptTransactions`;
    static SUB_INVENTORY = `${NODE_URL}EBS/20D/getSubinventories/`;
    static REASONS = `${NODE_URL}EBS/20D/getreasons/`
    static LOCATORS = `${NODE_URL}EBS/20D/getLocators/`
    static GL_PERIODS = `${NODE_URL}EBS/20D/getGLPeriods/`
    static INVENTORY_PERIODS = `${NODE_URL}EBS/20D/getInventoryPeriods/`
    static PURCHASING_PERIODS = `${NODE_URL}EBS/20D/getPurchasingPeriods/`
    static LOTS = `${NODE_URL}EBS/22A/getLotsTableType/`
    static SERIALS = `${NODE_URL}EBS/22A/getSerialTableType/`
    static UOM = `${NODE_URL}EBS/20D/getUnitOfMeasuresConversions/`
    static REVISIONS = `${NODE_URL}EBS/20D/getItemRevisions/`
}

export enum TableNames {
  LOGIN = "LOGIN",
  USERS = "USERS",
  ORGANIZATIONS = "ORGANIZATIONS",
  DOCS4RECEIVING = "DOCS4RECEIVING",
  TRANSACTIONS = "TRANSACTIONS",
  SUB_INVENTORY = "SUB_INVENTORY",
  GET_REASONS = "GET_REASONS",
  LOCATORS = "LOCATORS",
  GL_PERIODS = "GL_PERIODS",
  INVENTORY_PERIODS = "INVENTRY_PERIODS",
  PURCHASING_PERIODS = "PURCHASING_PERIODS",
  LOTS = "LOTS",
  SERIALS = "SERIALS",
  UOM = "UOM",
  REVISIONS = "REVISIONS",
}

export enum MESSAGES {
  SUCCESS = "Success",
  FAILED = "Failed",
  ERROR = "Error",
  UNAUTHORIZED = "Unauthorized",
  TIMEOUT = "Timeout",
  NO_INTERNET = "Please check your internet connection and try again.",
}

export enum TypeOfApi {
  METADATA = 'metadata',
  CONFIG = 'config',
  GET_DATA = 'data'
}

export enum RESPONSIBILITIES {
  GL_PERIODS = "GL_PERIODS",
  PURCHASING_PERIODS = "PURCHASING_PERIODS",
  INVENTORY_PERIODS = "INVENTORY_PERIODS",
  GET_REASONS = "GET_REASONS",
  DOCS4RECEIVING = "GOODS RECEIPT",
  SUB_INVENTORY = "SUB_INVENTORY",
  LOCATORS = "LOCATORS",
  SERIALS = "SERIALS",
  LOTS = "LOTS",
  UOM = "UOM",
  REVISIONS = "REVISIONS",

}

export interface LocationInterface {
    id: number;
    location: string;
    lastUpdated: Date;
  };

  export interface Org {
    InventoryOrgId_PK: number;
    BusinessUnitId: number;
    BusinessUnitName: string;
    InventoryOrgCode: string;
    SiteType: string | null;
    InventoryOrgName: string;
    MasterOrganizationId: number;
    IsWMSEnabled: string;
    DefaultDestSubInventory: string;
    LastUpdateDate: Date;
  }

  export interface HistoryInterface extends LocationInterface {
    status: string
  }

  export interface LoginDataInterface {
    STATUS: number,
    USER_NAME: string,
    USER_ID: number,
    TIMESTAMP: string,
    TIMEZONE_OFFSET: string,
    FULL_NAME: string,
    PERSON_ID: number,
    RESPONSIBILITY: string,
    SET_OF_BOOK_ID: string,
    DEFAULT_ORG_ID: string,
    DEFAULT_OU_NAME: string,
    DEFAULT_INV_ORG_ID: number,
    DEFAULT_INV_ORG_NAME: string,
    DEFAULT_INV_ORG_CODE: string,
    RESPONSIBILITY_ID: number,
    RESP_APPLICATION_ID: number
  };

  // export interface PoInterface {
  //   PO_NUMBER: string, 
  //   PO_TYPE: string, 
  //   VENDOR_NAME: string, 
  //   LAST_UPDATE_DATE: Date,
  //   TOTAL: number,
  //   REQUESTOR: string
  // }
