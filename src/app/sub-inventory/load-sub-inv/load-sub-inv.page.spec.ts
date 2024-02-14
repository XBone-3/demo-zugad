import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadSubInvPage } from './load-sub-inv.page';

describe('LoadSubInvPage', () => {
  let component: LoadSubInvPage;
  let fixture: ComponentFixture<LoadSubInvPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LoadSubInvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
