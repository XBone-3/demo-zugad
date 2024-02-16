import { Component, OnDestroy, OnInit } from '@angular/core';
import { UiProviderService } from '../providers/ui-provider.service';
import { NodeApiService } from '../providers/node-api.service';
import { NavController } from '@ionic/angular';
import { Org } from '../CONSTANTS/CONSTANTS';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-select-org',
  templateUrl: './select-org.page.html',
  styleUrls: ['./select-org.page.scss'],
})
export class SelectOrgPage implements OnInit, OnDestroy {

  orgList: Org[] = [];
  org: Org | any;
  isAllOrgTableData: boolean = false;
  isAllOrgTableDataLoaded: boolean = false;
  isOrgSelected: boolean = false;
  selectedOrg: any;
  public organisations: Org[] = [];
  searchTerm: string = "";
  activeSubscriptions: Subscription[] = [];

  constructor(
    private uiproviderService: UiProviderService,
    private apiService: NodeApiService,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    await this.getAllOrgs();
  }

  async getAllOrgs() {
    this.isAllOrgTableData = await this.apiService.getValue('isAllOrgTableData')
    let org_id = await this.apiService.getValue('orgId')
    this.uiproviderService.presentLoading('Loading...');
    if (!this.isAllOrgTableData) {
      this.apiService.fetchAllOrgTableData(org_id).subscribe({
        next: async (orgData) => {
          if (orgData) {
            await this.apiService.setValue('allOrgTableData', orgData);
            const allOrgTableData = await this.apiService.getValue('allOrgTableData')
            allOrgTableData.splice(1).forEach((element: any[]) => {
            this.org = {
              InventoryOrgId_PK: element[0],
              BusinessUnitId: element[1],
              BusinessUnitName: element[2],
              InventoryOrgCode: element[3],
              SiteType: element[4],
              InventoryOrgName: element[5],
              MasterOrganizationId: element[6],
              IsWMSEnabled: element[7],
              DefaultDestSubInventory: element[8],
              LastUpdateDate: element[9]
            }
            this.orgList.push(this.org);
          });
          this.organisations = [...this.orgList] 
        } 
      },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          this.uiproviderService.dismissLoading();
        }
      })
                   
    }
    else {
      console.log("allOrgTableData already loaded");
      this.uiproviderService.dismissLoading();
    }
  }

  onSearch() {
    this.organisations = this.orgList.filter((org) => {
        return (org.InventoryOrgName.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
      })
  }

  onSelect(org: Org) {
    this.selectedOrg = org;
    this.isOrgSelected = true;
    // console.log("selectedOrg", this.selectedOrg);
  }

  async onConfirm() {
    console.log("selectedOrg", this.selectedOrg);
    if (this.selectedOrg) {
      await this.apiService.setValue('selectedOrg', this.selectedOrg);
      localStorage.setItem('orgId_pk', this.selectedOrg.InventoryOrgId_PK);
      await this.apiService.setValue('selectedOrgId', this.selectedOrg.InventoryOrgCode);
      this.navCtrl.navigateForward('/activity');
    }
    // this.router.navigate(['/activity']);
  }

  onPullRefresh(event: any) {
    setTimeout(() => {
      this.getAllOrgs();
      event.target.complete();
    }, 2000);
  }

  ngOnDestroy(): void {
    this.activeSubscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
