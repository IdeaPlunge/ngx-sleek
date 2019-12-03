import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  SlkGridDataSource,
  SlkSortDirective,
  SlkPaginatorComponent,
  SlkGridFilterDirective,
  SlkRowSelectDirective
} from 'ngx-sleek';
import * as dummy from './dummy';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  expression = false;

  @ViewChild(SlkSortDirective) sort: SlkSortDirective;
  // @ViewChild(SlkPaginatorComponent) paginator: SlkPaginatorComponent;
  @ViewChild(SlkGridFilterDirective) filter: SlkGridFilterDirective;
  @ViewChild(SlkRowSelectDirective) select: SlkRowSelectDirective;

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
  // dataSource: any;
  dataSource = new SlkGridDataSource();
  totalLength: number;

  constructor(private titleService: Title) {
    setTimeout(() => {

    }, 10);
  }

  ngOnInit() {
    this.titleService.setTitle('Home | ngx-sleek');

    // this.dataSource.sort = this.sort;

    this.dataSource.data = dummy.gridData;
    this.expression = true;
    // this.dataSource.filter = this.filter;
    this.totalLength = dummy.gridData.length;
    // console.log()
  }

  test(obj: any) {
    console.log('obj', obj);
  }

  ngAfterViewInit() {
    // this.dataSource.data = dummy.gridData;
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.data = dummy.gridData;
    this.dataSource.filter = this.filter;
    this.dataSource.select = this.select;
  }

  scrolled(event: any) {
    console.log('$event', event);
  }

  onclick(element: any) {
    console.log('element', element);
  }

}
