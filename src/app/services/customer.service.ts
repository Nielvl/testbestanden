import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { customerData } from '../../assets/customerData';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customers: Customer[] = customerData.customers;
  private customersSubject = new BehaviorSubject<Customer[]>(this.customers);

  getCustomers(): Observable<Customer[]> {
    return this.customersSubject.asObservable();
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(customer => customer.id === id);
  }

  searchCustomers(filter: string): void {
    const filteredCustomers = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(filter.toLowerCase()) ||
      (customer.customerNumber && customer.customerNumber.includes(filter)) ||
      (customer.timeSlot && customer.timeSlot.toLowerCase().includes(filter.toLowerCase()))
    );
    this.customersSubject.next(filteredCustomers);
  }

  sortCustomers(byTime: boolean): void {
    let sortedCustomers = [...this.customers];
    if (byTime) {
      sortedCustomers.sort((a, b) => {
        if (!a.timeSlot && !b.timeSlot) return 0;
        if (!a.timeSlot) return 1;
        if (!b.timeSlot) return -1;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
    } else {
      sortedCustomers.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.customersSubject.next(sortedCustomers);
  }
}