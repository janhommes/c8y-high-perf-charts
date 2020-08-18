import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  dataList: any[];
  timeRange: [Date, Date];
  timeRangeA: [Date, Date];
  realtime;

  ngOnInit() {
    this.createList();
  }

  createList() {
    const dataList = (this.dataList = []);
    for (let i = 0; i < 5; i++) {
      dataList.push({
        dataCached: [],
        dataPoint: {},
      });
    }
  }
}
