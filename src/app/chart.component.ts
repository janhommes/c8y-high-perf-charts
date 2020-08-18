import {
  Component,
  ElementRef,
  Host,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import uPlot from 'uplot';
import { C8yDataDirective } from './data.directive';

@Component({
  selector: 'c8y-chart',
  template: `<div #container></div>`,
})
export class C8yChartComponent implements OnInit {
  @ViewChild('container', { read: ElementRef, static: true })
  container: ElementRef;
  @Input() data: Observable<any>;
  uplot: uPlot;
  opts: uPlot.Options;

  constructor(@Host() private c8yData: C8yDataDirective) {}

  ngOnInit() {
    this.c8yData.data$
      .pipe(
        map((data) => {
          const x = data.series.map(({ data }) => data);

          return {
            values: [data.range, ...x],
            series: data.series,
          };
        })
      )
      .subscribe((d) => {
        this.render(d.values, d.series);
      });
  }

  render(d, series) {
    if (this.uplot && this.uplot.series[0].min === d[0][0]) {
      for (const serie of series) {
        if (!this.uplot.series.find((s) => s.label === serie.label)) {
          this.uplot.addSeries(serie);
        }
      }
      this.uplot.setData(d);
    } else {
      this.init(series, d);
    }
  }

  private init(series: any, d: any) {
    if (this.uplot) {
      this.uplot.destroy();
    }
    this.opts = {
      title: 'My Chart',
      id: 'chart1',
      class: 'my-chart',
      width: 800,
      height: 600,
      series: [{}, ...series],
    };
    this.uplot = new uPlot(this.opts, d, this.container.nativeElement);
  }
}
