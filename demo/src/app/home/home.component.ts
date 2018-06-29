import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // the hard coded columns will be changed in future
  columns = [
    'FIRST_NAME',
    'LAST_NAME',
    'EMAIL',
    'PASSWORDS',
    'ROLES',
    'LOCATIONS',
    'ID'
  ];
  dummyColumn: Array<string> = [];
  // set value for server or client side method handling
  clientRendering = true;

  // plane data array to display in the table
  // dataSource: any;

  // search required
  searchRequired = true;

  // pagination required if scrolling required turn pagination to false
  pagination = true;

  // rows per page
  rowsPerPage = 10;
  // rowsPerPage: number;

  // set the row click event
  rowClickable = true;

  // set sorting property
  sort = true;

  // dummy data for testing
  dataSource: any;

  constructor(private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('Home | ngx-sleek');

    this.dataSource = [
      {
        'FIRST_NAME': 'qZH5HQ',
        'LAST_NAME': 'Jyg9yO',
        'EMAIL': 'uTpGhX@5oCU.com',
        'PASSWORDS': '*********',
        'ROLES': 'ZcVvB',
        'LOCATIONS': 'ZcVvB',
        'ID': 13
      },
      {
        'FIRST_NAME': 'Z19Qyl',
        'LAST_NAME': 'Z4ow3z',
        'EMAIL': 'q8lIZx@JZ0f.com',
        'PASSWORDS': '*********',
        'ROLES': 'Cr1va',
        'LOCATIONS': 'LQh3p0QL',
        'ID': 9
      },
      {
        'FIRST_NAME': 'G600Te',
        'LAST_NAME': 'EBei4x',
        'EMAIL': 'btrHKq@NJO0.com',
        'PASSWORDS': '*********',
        'ROLES': '8q3TY',
        'LOCATIONS': 'xp68ffba',
        'ID': 3
      },
      {
        'FIRST_NAME': 'jkhqJE',
        'LAST_NAME': 'WdTswx',
        'EMAIL': 'WCraL0@hl5e.com',
        'PASSWORDS': '*********',
        'ROLES': 'GUMyu',
        'LOCATIONS': 'zWhNt9vi',
        'ID': 7
      },
      {
        'FIRST_NAME': '6EMEnx',
        'LAST_NAME': 'HiQU4H',
        'EMAIL': 'WPMh2j@ix4m.com',
        'PASSWORDS': '*********',
        'ROLES': 'YNETa',
        'LOCATIONS': 'gguvSzRs',
        'ID': 13
      },
      {
        'FIRST_NAME': 'DhqHOw',
        'LAST_NAME': 'tITkrr',
        'EMAIL': '2yyrvg@dxqv.com',
        'PASSWORDS': '*********',
        'ROLES': 'BGd2g',
        'LOCATIONS': 'nUuKu0Wx',
        'ID': 2
      },
      {
        'FIRST_NAME': 'RBtBr3',
        'LAST_NAME': 'YPolBr',
        'EMAIL': 'Q5Aal4@1a7q.com',
        'PASSWORDS': '*********',
        'ROLES': 'jt24C',
        'LOCATIONS': 'upzjq24G',
        'ID': 9
      }
    ];
  }

  onRowClick(obj: any) {
    console.log('obj', obj);
  }



}
