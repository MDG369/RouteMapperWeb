import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppComponent} from "./app.component";
import {HttpClientModule} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {LeafletModule} from "@asymmetrik/ngx-leaflet";


@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    LeafletModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
