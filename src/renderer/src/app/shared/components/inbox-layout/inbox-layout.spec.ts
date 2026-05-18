import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxLayout } from './inbox-layout';

describe('InboxLayout', () => {
  let component: InboxLayout;
  let fixture: ComponentFixture<InboxLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboxLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(InboxLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
