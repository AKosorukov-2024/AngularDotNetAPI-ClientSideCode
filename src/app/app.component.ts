import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Customer } from './customer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public customer: Customer = new Customer();
  public customerTypes: string[] = ['Loyal', 'Impulse', 'Discount'];
  public typeID: string = '';

  public stateNames: string[] = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  private stateAbbreviations: string[] = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  private baseUrl: string = 'https://localhost:7185/api/Customers';
  constructor(private http: HttpClient) {
  }

  public onCustomerTypeSelected(typeID: string): void {
    const index: number = this.customerTypes.indexOf(typeID);
    this.customer.customerTypeId = index < 0 ? '' : this.customerTypes[index];
  }

  public onStateSelected(state: string): void {
    const index: number = this.stateNames.indexOf(state);
    this.customer.stateCode = index < 0 ? '' : this.stateAbbreviations[index];
  }

  public async httpGetCustomerList(): Promise<void> {
    const result = await this.checkConnection();
    if (!result) {
      this.showStatus("Server is down!");
      return;
    }
    const headers: HttpHeaders = new HttpHeaders()
      .append('Content-Type', 'application/json')

    let params = new HttpParams();
    this.http.get(this.baseUrl + '/CustomerList', 
      { headers: headers, params: params }).subscribe(data => {
      const response = JSON.parse(data.toString());
      const ctab = document.getElementById('ctab');
      if (!ctab) {
        return;
      }
      ctab.replaceChildren();

      if (Object.hasOwn(response, "ErrorMessage")) {
        this.showStatus(response.ErrorMessage);
        return;
      }
      const customers = JSON.parse(data.toString());
      const tbl = document.createElement("table");
      tbl.setAttribute('id', 'listTable');

      const tblBody = document.createElement("tbody");

      // get all field names from the object
      const fields: string[] = Object.getOwnPropertyNames(customers[0]);

      for (let i: number = 0; i < customers.length; i++) {
        // create a table row
        const row = document.createElement("tr");
        for (let j = 0; j < fields.length; j++) {
          // create a <td> element 
          const cell = document.createElement("td");
          // get field's value in the cellText
          const cellText = document.createTextNode(`${customers[i][fields[j]]}`);
          cell.appendChild(cellText);
          row.appendChild(cell);
        }

        // add the row to the end of the table body
        tblBody.appendChild(row);
      }

      // put the <tbody> in the <table>
      tbl.appendChild(tblBody);
      // sets the border attribute of tbl to '2'
      tbl.setAttribute("border", "2");
      // appends <table> into <body>
      ctab.appendChild(tbl);

      this.showStatus("Success");
    });
  }

  public async httpGetCustomer(): Promise<void> {
    const result = await this.checkConnection();
    if (!result) {
      this.showStatus("Server is down!");
      return;
    }

    if (this.customer.customerId.trim().length == 0) {
      this.showStatus("The field 'CustomerId' cannot be empty!");
      return;
    }
    const headers: HttpHeaders = new HttpHeaders()
      .append('Content-Type', 'application/json')

    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('CustomerId', this.customer.customerId);

    this.http.get(this.baseUrl, { headers: headers, params: params }).subscribe(data => {
      const response = JSON.parse(data.toString());
      if (Object.hasOwn(response, "ErrorMessage")) {
        this.showStatus(response.ErrorMessage);
        return;
      }
      this.customer.customerName = response.CustomerName;
      this.customer.createdDate = response.CreatedDate;
      this.customer.customerTypeId = response.CustomerTypeId;
      this.customer.stateCode = response.StateCode;

      const customerTypeIdSelect = document.getElementById('customerType') as HTMLSelectElement;
      customerTypeIdSelect.selectedIndex = this.customerTypes.indexOf(this.customer.customerTypeId) + 1;
      const stateSelect = document.getElementById('state') as HTMLSelectElement;
      stateSelect.selectedIndex = this.stateAbbreviations.indexOf(this.customer.stateCode) + 1;

      this.showStatus("Success");
    });
  }

  public async httpUpdate(): Promise<void> {
    const result = await this.checkConnection();
    if (!result) {
      this.showStatus("Server is down!");
      return;
    }

    if (this.customer.customerId.trim().length == 0
      || this.customer.customerName.trim().length == 0
      || this.customer.createdDate.trim().length == 0
      || this.customer.customerTypeId.trim().length == 0
      || this.customer.stateCode.trim().length == 0) {
      this.showStatus("Please fill in all fields!");
      return;
    }
    const customerUpdated = JSON.stringify(this.customer);
    const headers: HttpHeaders = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('customer', customerUpdated)

    try {
      this.http.put(this.baseUrl, '', {
        headers: headers
      }).subscribe(data => {
        this.showStatus(data.toString());
      });
    }
    catch (ex) {
      console.log((ex as Error).message);
    }
  }

  public async httpPost(): Promise<void> {
    const result = await this.checkConnection();
    if (!result) {
      this.showStatus("Server is down!");
      return;
    }

    if (this.customer.customerId.trim().length == 0
      || this.customer.customerName.trim().length == 0
      || this.customer.createdDate.trim().length == 0
      || this.customer.customerTypeId.trim().length == 0
      || this.customer.stateCode.trim().length == 0) {
      this.showStatus("Please fill in all fields!");
      return;
    }

    const customerUpdated = JSON.stringify(this.customer);

    const headers: HttpHeaders = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('customer', customerUpdated)

    this.http.post(this.baseUrl, '', {
      headers: headers
    }).subscribe(data => {
      this.showStatus(data.toString());
    });
  }

  public async httpDelete(): Promise<void> {
    const result = await this.checkConnection();
    if (!result) {
      this.showStatus("Server is down!");
      return;
    }

    if (this.customer.customerId == "") {
      this.showStatus("The field 'Customer Id' cannot be zero!");
      return;
    }

    let params = new HttpParams();
    // Begin assigning parameters
    params = params.append('CustomerId', this.customer.customerId);

    this.http.delete(this.baseUrl, { params: params }).subscribe(data => {
      this.showStatus(data.toString());
    });
  }

  public cleanup(): void {
    this.customer.customerId = "";
    this.customer.customerName = "";
    this.customer.createdDate = "";
    this.customer.customerTypeId = "";
    this.customer.stateCode = "";
    const elem = document.getElementById("txtArea") as HTMLTextAreaElement;
    elem.innerText = "";
    const ctab = document.getElementById('ctab');
    if (ctab) {
      ctab.replaceChildren();
    }
  }

  private showStatus(text: string): void {
    const elem = document.getElementById("txtArea") as HTMLTextAreaElement;
    elem.innerText = text;
  }

  private async checkConnection(): Promise<boolean> {
    let result: boolean = false;
    await fetch(this.baseUrl, { method: 'GET' })
      .then(response => response)
      .then(() => {
        result = true;
      })
      .catch((error) => {
        console.log(error.message);
        const ctab = document.getElementById('ctab');
        if (ctab) {
          ctab.replaceChildren();
        }
        result = false;
      });
    return result;
  }
}
