export const node_url: string = "https://testnode.propelapps.com/";
// reference urls
// loginUrl: string = `${node_url}EBS/20D/login`;
// getInventoryOrgUrl: string = `${node_url}EBS/20D/getInventoryOrganizations/''`;
// getInventoryOrgTablesUrl: string = `${node_url}EBS/23A/getInventoryOrganizationsTable/`;
// getLocationsUrl: string = `${node_url}EBS/20D/getLocations/"10-JUN-2024 10:10:00"/""`;
// getDocs4ReceivingUrl: string = `${node_url}EBS/20D/getDocumentsForReceiving/7963/""/""`;
// getMoveOrdersUrl: string = `${node_url}EBS/20D/getMoveOrders/`;


export class ApiSettings {
    static loginUrl = `${node_url}EBS/20D/login`;
    static InventoryOrgUrl = `${node_url}EBS/20D/getInventoryOrganizations/''`;
    static InventoryOrgTablesUrl = `${node_url}EBS/23A/getInventoryOrganizationsTable/`;
    static LocationsUrl = `${node_url}EBS/20D/getLocations/"10-JUN-2024 10:10:00"/""`;
    static Docs4ReceivingUrl = `${node_url}EBS/20D/getDocumentsForReceiving/`;
    static MoveOrdersUrl = `${node_url}EBS/20D/getMoveOrders/`;
    static createGoodsReceiptUrl = `${node_url}EBS/20D/createGoodsReceiptTransactions`;
    static subInventoryUrl = `${node_url}EBS/20D/getSubinventories/`;
    static reasonsConfigUrl = `${node_url}EBS/20D/getreasons/`
    static locatorsURL = `${node_url}EBS/20D/getLocators/`
    static glPeriodsUrl = `${node_url}EBS/20D/getGLPeriods/`
    static inventoryPeriodsUrl = `${node_url}EBS/20D/getInventoryPeriods/`
    static purchasingeriodsUrl = `${node_url}EBS/20D/getPurchasingPeriods/`
    static lotsUrl = `${node_url}EBS/22A/getLotsTableType/`
    static serialsUrl = `${node_url}EBS/22A/getSerialTableType/`
    static uomUrl = `${node_url}EBS/20D/getUnitOfMeasuresConversions/`
    static revisionsUrl = `${node_url}EBS/20D/getItemRevisions/`
}