import {
  Component,
  Output,
  EventEmitter,
  Input,
  SimpleChange,
  SimpleChanges,
  Host,
} from '@angular/core';
import { Observable, Subject, interval, of, BehaviorSubject } from 'rxjs';
import { map, scan, share, filter, shareReplay } from 'rxjs/operators';
import { TimeRange } from './time.component';

@Component({
  selector: 'c8y-data',
  template: ` <form #f="ngForm">
      <!--<input
        type="number"
        placeholder="precision"
        [(ngModel)]="precision"
        name="precision"
      />
      <button (click)="createSeries()">Create series</button>-->
    </form>
    <ng-content></ng-content>`,
})
export class C8yDataDirective {
  @Input() realtime: boolean;
  precision = 1000;
  private INTERVAL = 1000;
  private interval = undefined;

  data$ = new BehaviorSubject<{ series: any; range: [] }>({
    series: [],
    range: [],
  });

  private data: any = {
    range: [],
    series: {},
  };
  private sampleData = [];

  constructor(@Host() private range: TimeRange) {
    this.range.range$.subscribe(() => {
      this.ngOnInit();
    });
  }

  createSeries() {
    this.sampleData.push(this.createSampleData(this.precision));
    this.mapSeriesData(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.realtime && !changes.realtime.firstChange) {
      if (this.interval && !changes.realtime.currentValue) {
        console.log('realtime stoped');
        clearInterval(this.interval);
      } else {
        console.log('realtime started');
        this.interval = setInterval(
          () => this.generateRealtimeData(),
          this.INTERVAL
        );
      }
    }
  }

  ngOnInit() {
    this.sampleData[0] = this.createSampleData();
    this.mapSeriesData();
  }

  createSampleData(ms = 1000) {
    const [from, to] = this.range.dates;
    const date = new Date(from.getTime());
    const dateTo = to.getTime();
    const samples = [];
    while (date.getTime() <= dateTo) {
      date.setMilliseconds(date.getMilliseconds() + ms); // CHANGE HERE FOR MS
      samples.push({
        timestamp: date.getTime(),
        value: Math.floor(Math.random() * 100),
      });
    }
    const test = Math.floor(Math.random() * 100);
    return {
      data: samples,
      label: `Series ${test}`,
      stroke: `rgb(${Math.floor(Math.random() * 100)},${Math.floor(
        Math.random() * 100
      )},${Math.floor(Math.random() * 100)})`,
    };
  }

  mapSeriesData(updateRange = true, precision = 1000) {
    const [from, to] = this.range.dates;
    const date = new Date(from.getTime());
    const dateTo = to.getTime();
    const range = [];

    this.data.series = this.sampleData.map(({ label, stroke }) => ({
      label,
      stroke,
      data: [],
    }));

    while (date.getTime() <= dateTo) {
      date.setMilliseconds(date.getMilliseconds() + precision);
      range.push(date.getTime());
      for (let i = 0; i < this.data.series.length; i++) {
        const data = this.getData(
          this.sampleData[i].data,
          date.getTime(),
          precision
        );
        this.data.series[i].data.push(data);
      }
    }

    if (updateRange) {
      this.data.range = range;
    }
    console.log(this.data);
    this.data$.next(this.data);
  }

  getData(samples, timestamp: number, precision: number) {
    const found = samples.find((sample) => {
      return (
        Math.floor(sample.timestamp / precision) ===
        Math.floor(timestamp / precision)
      );
    });
    return found ? found.value : null;
  }

  generateRealtimeData() {
    const now = new Date().getTime();
    this.data.range.shift();
    this.data.range.push(now);
    for (const series of this.data.series) {
      series.data.shift();
      series.data.push(Math.floor(Math.random() * 100));
    }
    this.data$.next(this.data);
  }
}
