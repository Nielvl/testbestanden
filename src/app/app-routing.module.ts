import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { WarehouseListComponent } from './components/warehouse-list/warehouse-list.component';
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component';
import { WarehouseDetailComponent } from './components/warehouse-detail/warehouse-detail.component';

const routes: Routes = [
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  { path: 'warehouses', component: WarehouseListComponent },
  { path: 'warehouses/:id', component: WarehouseDetailComponent },
  { path: '', redirectTo: '/customers', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }