import {
  Component,
  Output,
  Input,
  EventEmitter,
  ElementRef,
  Host,
  forwardRef,
  Inject,
  Optional,
  Injector,
  ReflectiveInjector,
  SkipSelf,
  SimpleChanges,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'c8y-time-range',
  template: ` <hr />
    <label>
      <input type="checkbox" (change)="realtime = $event.target.checked" />
      realtime
    </label>
    <input
      type="range"
      min="1"
      max="500"
      [value]="value"
      (change)="change($event.target.value)"
      [disabled]="
        ((locked$ | async) === true && hasParent) ||
        ((locked$ | async) === false && !hasParent)
      "
    />
    <label>
      <input
        type="checkbox"
        [checked]="locked$ | async"
        (change)="locking()"
        #checkbox
      />
      locked
    </label>
    <br />
    <ng-content></ng-content>`,
})
export class TimeRange {
  realtime: boolean = false;
  @Output() range = new EventEmitter();

  @ViewChild('checkbox', { read: ElementRef, static: true })
  checkbox: ElementRef;
  dates = [new Date(), new Date()];

  value: number = 1;
  locked$ = new BehaviorSubject<boolean>(true);
  range$ = new BehaviorSubject<number | null>(1);
  hasParent = true;

  constructor(
    public element: ElementRef,
    @SkipSelf() @Host() @Optional() private parentRange: TimeRange
  ) {
    if (parentRange) {
      this.parentRange.locked$.subscribe((lock) => {
        this.locked$.next(lock);
        if (this.hasParent) {
          this.value = this.parentRange.value;
          this.change(this.value);
        }
      });

      this.parentRange.range$.subscribe((val) => {
        if (this.locked$.value && val) {
          this.value = val;
          this.change(this.value);
        }
      });
    } else {
      this.hasParent = false;
    }

    this.range$.subscribe((val) => {
      if (val === null) {
        (this.checkbox.nativeElement as HTMLInputElement).indeterminate = true;
      }
    });
  }

  locking(shouldLock = !this.locked$.value) {
    if (this.hasParent) {
      if (shouldLock) {
        console.log(this.parentRange.value);
        this.value = this.parentRange.value;
        this.change(this.value);
      } else {
        this.parentRange.range$.next(null);
      }
    }
    this.locked$.next(shouldLock);
  }

  change(value) {
    const from = new Date();
    const to = new Date();
    from.setMinutes(from.getMinutes() - value);
    this.dates = [from, to];
    this.range.emit([from, to]);
    this.range$.next(value);
  }
}
