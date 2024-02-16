import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-uom',
  templateUrl: './uom.page.html',
  styleUrls: ['./uom.page.scss'],
})
export class UomPage implements OnInit {

  @Input() quantityEntered: number = 0
  @Input() uomCode: any = "";
  @Output() openUom: EventEmitter<any> = new EventEmitter<any>();
  @Output() quantityChange: EventEmitter<number> = new EventEmitter<number>();
  constructor() { }

  ngOnInit() {
  }

  onOpenUomRecords() {
    this.openUom.emit();
  }

  onQuantityChange() {
    this.quantityChange.emit(this.quantityEntered);
  }

}
