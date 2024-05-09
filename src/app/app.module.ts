import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppComponent} from "./app.component";
import {HttpClientModule} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {LeafletModule} from "@asymmetrik/ngx-leaflet";
// need for animations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DevUIModule } from 'ng-devui';


@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    LeafletModule,
    BrowserAnimationsModule,
    DevUIModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
