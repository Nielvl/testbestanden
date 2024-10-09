import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm: string = '';
  isTimeSort: boolean = true;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    });
  }

  onSearch(): void {
    this.customerService.searchCustomers(this.searchTerm);
  }

  onSortChange(): void {
    this.isTimeSort = !this.isTimeSort;
    this.customerService.sortCustomers(this.isTimeSort);
  }
}