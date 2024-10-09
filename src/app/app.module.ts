import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { WarehouseListComponent } from './components/warehouse-list/warehouse-list.component';
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component';
import { WarehouseDetailComponent } from './components/warehouse-detail/warehouse-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomerListComponent,
    WarehouseListComponent,
    CustomerDetailComponent,
    WarehouseDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }