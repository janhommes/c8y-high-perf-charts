import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { C8yChartComponent } from './chart.component';
import { C8yDataDirective } from './data.directive';
import { TimeRange } from './time.component';
import { TestComponent } from './test/test.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    C8yDataDirective,
    TimeRange,
    C8yChartComponent,
    TestComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
