import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sub-inv',
  templateUrl: './sub-inv.page.html',
  styleUrls: ['./sub-inv.page.scss'],
})
export class SubInvPage implements OnInit {

  @Input() subInv: any = '';
  @Output() subInvChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() openSubInv: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearSubInv: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  onOpenSubInv() {
    this.openSubInv.emit();
  }

  onClearSubInv() {
    this.clearSubInv.emit();
  }

  onSubInvChange() {
    this.subInvChange.emit(this.subInv);
  }

}
