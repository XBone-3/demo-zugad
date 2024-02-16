import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-locator',
  templateUrl: './locator.page.html',
  styleUrls: ['./locator.page.scss'],
})
export class LocatorPage implements OnInit {

  @Input() locator: any = "";
  @Output() locatorChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() openLocator: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearLocator: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  onOpenLocator() {
    this.openLocator.emit();
  }
  onClearLocator() {
    this.clearLocator.emit();
  }
  onLocatorChange() {
    this.locatorChanged.emit(this.locator);
  }
}
