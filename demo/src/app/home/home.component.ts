import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SlkGridDataSource, SlkSortDirective } from 'ngx-sleek';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(SlkSortDirective) sort: SlkSortDirective;

  // the hard coded columns will be changed in future
  columns = [
    'FIRST_NAME',
    'LAST_NAME',
    'EMAIL',
    'PASSWORDS',
    'ROLES',
    'LOCATIONS'
  ];
  dummyColumn: Array<string> = [];
  // set value for server or client side method handling
  clientRendering = true;

  // dummy data for testing
  // dataSource = new SlkGridDataSource();
  dataSource: any;

  constructor(private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('Home | ngx-sleek');

    // this.dataSource.sort = this.sort;

    this.dataSource = [
      {
        FIRST_NAME: 'qZH5HQ',
        LAST_NAME: 'Jyg9yO',
        EMAIL: 'uTpGhX@5oCU.com',
        PASSWORDS: '*********',
        ROLES: 'ZcVvB',
        LOCATIONS: 'ZcVvB'
      },
      {
        FIRST_NAME: 'Z19Qyl',
        LAST_NAME: 'Z4ow3z',
        EMAIL: 'q8lIZx@JZ0f.com',
        PASSWORDS: '*********',
        ROLES: 'Cr1va',
        LOCATIONS: 'LQh3p0QL'
      },
      {
        FIRST_NAME: 'G600Te',
        LAST_NAME: 'EBei4x',
        EMAIL: 'btrHKq@NJO0.com',
        PASSWORDS: '*********',
        ROLES: '8q3TY',
        LOCATIONS: 'xp68ffba'
      },
      {
        FIRST_NAME: 'jkhqJE',
        LAST_NAME: 'WdTswx',
        EMAIL: 'WCraL0@hl5e.com',
        PASSWORDS: '*********',
        ROLES: 'GUMyu',
        LOCATIONS: 'zWhNt9vi'
      },
      {
        FIRST_NAME: '6EMEnx',
        LAST_NAME: 'HiQU4H',
        EMAIL: 'WPMh2j@ix4m.com',
        PASSWORDS: '*********',
        ROLES: 'YNETa',
        LOCATIONS: 'gguvSzRs'
      },
      {
        FIRST_NAME: 'DhqHOw',
        LAST_NAME: 'tITkrr',
        EMAIL: '2yyrvg@dxqv.com',
        PASSWORDS: '*********',
        ROLES: 'BGd2g',
        LOCATIONS: 'nUuKu0Wx'
      },
      {
        FIRST_NAME: 'RBtBr3',
        LAST_NAME: 'YPolBr',
        EMAIL: 'Q5Aal4@1a7q.com',
        PASSWORDS: '*********',
        ROLES: 'jt24C',
        LOCATIONS: 'upzjq24G'
      }
    ];
  }

  test(obj: any) {
    console.log('obj', obj);
  }



}
