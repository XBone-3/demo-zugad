export const loginTableName = "login_data";
export const locationTableName = "locations";
export const historyTableName = "history";
export const userDetailsTableName = "user_details";
export const docsForReceivingTableName = "docs_for_receiving";
export const transactionTableName = "transaction_history";
export const subInventoryTableName = "sub_inventory";
export const getReasonsTableName = "get_reasons";
export const locatorsTableName = "locators"
export const glPeriodsTableName = "gl_periods";
export const inventoryPeriodsTableName = "inventory_periods";
export const purchasingPeriodsTableName = "purchasing_periods";
export const lotsTableName = "lots";
export const serialsTableName = "serials";
export const uomTableName = "uom";
export const revisionTableName = "revisions";


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

  export interface PoInterface {
    PO_NUMBER: string, 
    PO_TYPE: string, 
    VENDOR_NAME: string, 
    LAST_UPDATE_DATE: Date,
    TOTAL: number,
    REQUESTOR: string
  }
