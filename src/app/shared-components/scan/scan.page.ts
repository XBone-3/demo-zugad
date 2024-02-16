import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
// import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { UiProviderService } from 'src/app/providers/ui-provider.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {
  @Input() searchTerm: any = "";
  @Input() showSearch: boolean = false;
  @Output() toggleClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearSearchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendScanValue: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private uiProviderService: UiProviderService
  ) { }

  ngOnInit() { }


  // async scan(): Promise<void> {
  //   await BarcodeScanner.checkPermission({ force: true });
  //   BarcodeScanner.hideBackground();
  //   const result = await BarcodeScanner.startScan();
  //   if (result.hasContent) {
  //     this.sendScanValue.emit(result.content);
  //   }
  //   else {
  //     this.uiProviderService.presentToast('Error', 'invalid barcode', 'danger');
  //   }
  // }


  // stopScan() {
  //   BarcodeScanner.showBackground();
  //   BarcodeScanner.stopScan();
  // }


  updateFilteredOptions() {
    this.searchChange.emit(this.searchTerm);
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      //this.searchTerm = '';

    }
    this.toggleClick.emit(this.showSearch);
  }

  clearSearch() {
    this.searchTerm = '';
    this.clearSearchChange.emit(this.searchTerm)
  }

}
