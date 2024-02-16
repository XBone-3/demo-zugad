import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-serial',
  templateUrl: './serial.page.html',
  styleUrls: ['./serial.page.scss'],
})
export class SerialPage implements OnInit {

  @Input() serialData: any[] = [];
  @Output() openSerial: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  onOpenSerial() {
    this.openSerial.emit();
  }
}
