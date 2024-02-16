import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-revision',
  templateUrl: './item-revision.page.html',
  styleUrls: ['./item-revision.page.scss'],
})
export class ItemRevisionPage implements OnInit {

  @Input() itemRevCode: any = "";
  @Output() openRevision: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  onOpenRevision() {
    this.openRevision.emit();
  }

}
