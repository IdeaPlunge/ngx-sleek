import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  ViewChildren,
  QueryList,
  OnDestroy
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { SearchModel } from './search/search.model';

import * as methods from './grid.methods';

@Component({
  selector: 'slk-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})

export class NgxGridComponent implements
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy {
  // table renderer
  @ViewChild('table') table: ElementRef;
  // ng for changes renderer
  @ViewChildren('ngForChanges') ngForChanges: QueryList<any>;

  // columns name
  @Input() columns: Array<any>;
  // plane data source
  @Input() dataSource: Array<any>;
  // need search bar integrated
  @Input() searchRequired: boolean;
  // if user required pagination
  @Input() pagination: boolean;
  // rows per page if pagination is true, default is 10
  @Input() rowsPerPage = 10;
  // set flag for handling methods server or client side
  @Input() clientRendering: boolean;
  // row should be clickable or not
  @Input() rowClickable: boolean;
  // data for the table
  @Input() tableData: any;
  // number of pages
  @Input() totalPages: Array<number>;
  // is sorting required at client
  @Input() sort: boolean;
  // if sort columns are provided sorting only for selected columns
  @Input() sortColumns: any[];

  // event fired when page is changed by a user
  @Output() pageChange = new EventEmitter<any>();
  // event fired when row is clicked and when row is clickable passes row obj to user
  @Output() rowClick = new EventEmitter<any>();
  // sort event supports server side sorting
  @Output() sortEvent = new EventEmitter<any>();


  // set the data for table in a property
  realDataSource: any[];
  // set disabling property for left nav, set it to true initially
  disabledLeft = true;
  // set disabling property for right nav
  disabledRight = false;
  // store actual pages in the following property
  actualPages: number;
  // set selected index property
  selectedIndex = 1;
  // test
  isDisabled = true;
  // *****imp**** set page and selectedPage property to attach button-active class to first button by default
  page = 1;
  selectedPage = 1;
  // page index to be stored for paginator
  pagingIndexForScroll = 1;
  // ngForChanges$ detector
  ngForChanges$: Subscription;
  // public orientation: Orientation;
  public onSelectPage: any;

  private changeDetectorRef: ChangeDetectorRef;
  // create a bucket for all the letter and have reference to the row index
  searchBucket: SearchModel[] = [];
  // data to be displayed in the current page, this will restore the data when user is nomore using search
  dataOnCurrentPage: any[];

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.changeDetectorRef = changeDetectorRef;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    // changes in the table data
    if (this.tableData) {
      // actual pages
      this.actualPages = this.tableData.TotalPages;
      this.onSelectPage = this.totalPages[0];
    }

    // detect changes in dataSource and also ig client rendering property is true
    // currently clientrendering will be true please handle it later
    if (this.dataSource && this.clientRendering) {
      // store the data in a property of this component, this is only for client side
      this.realDataSource = [...this.dataSource];

      // if rows per page is undefined set default rows per page to 10
      if (!this.rowsPerPage) {
        this.rowsPerPage = 10;
      }
      // array to store data for rendering
      const newDataSource = [];

      // if row is clickable enter new column with empty string
      if (this.rowClickable) {
        // enter a empty string for an extra column
        this.columns.push('');

        for (let i = 0; i < this.rowsPerPage; i++) {
          newDataSource.push({
            ...this.dataSource[i],
            ['']: '✓'
          });
        }
      } else {

        for (let i = 0; i < this.rowsPerPage; i++) {
          newDataSource.push(this.dataSource[i]);
        }

      }
      // push a fake object to have extra padding on top
      let fakeObj = {};
      for (let i = 0; i < this.columns.length; i++) {
        fakeObj = {
          ...fakeObj,
          [this.columns[i]]: ''
        };
      }
      newDataSource.unshift(fakeObj);

      // display the final data
      this.dataSource = [...newDataSource];

      // store the current page data so when search is clear we can restore the data
      this.dataOnCurrentPage = [...newDataSource];

      // call a method to store all the words in search bucket after everything is done
      this.dataBucket();
    }

    // if sort column is not defined set sorting true for all the columns
    if (!this.sortColumns) {
      this.sortColumns = this.columns;
    }
  }

  ngAfterViewInit(): void {
    // look for the changes in ngFor directive
    this.ngForChanges$ = this.ngForChanges.changes.subscribe(t => {
      if (this.table && t.length !== 0) {
        this.checkForChangesDone();
      }
    });

  }

  checkForChangesDone(): void {
    const totalColumns = this.columns.indexOf('') !== -1
      ? this.columns.length - 1
      : this.columns.length;

    const getCellWidth = this.table.nativeElement.clientWidth / totalColumns;

    // set width for each th tag
    const thObjs = this.table.nativeElement.getElementsByTagName('th');

    for (let i = 0; i < totalColumns; i++) {
      this.renderer.setStyle(thObjs[i], 'width', `${getCellWidth}px`);

      // if sort is required by user add a class for displaying sort button
      // and enable click event
      if (this.sort) {
        // add a class for a sort icon
        this.renderer.listen(thObjs[i], 'click', (event: any) => {
          console.log('clicked', event.target.innerHTML);
          this.sortByColumn(event.target.innerHTML);
        });
      }
    }
    // set width for each td tag
    const tdObjs = this.table.nativeElement.getElementsByTagName('td');

    for (let i = 0; i < totalColumns; i++) {
      this.renderer.setStyle(tdObjs[i], 'width', `${getCellWidth}px`);
    }

    return;
  }

  onScroll(event: any): void {
    if (!this.pagination) {
      // viewport
      const tableViewHeight = event.target.offsetHeight;
      // length of all table
      const tableScrollHeight = event.target.scrollHeight;
      // how far user scrolled
      const scrollLocation = event.target.scrollTop;
      // calculate limit for each scroll
      const limit = tableScrollHeight - tableViewHeight;

      // if scroll location is greater than the limit
      if (scrollLocation === limit) {

        // increment the paged index for each time scrolling has finished
        this.pagingIndexForScroll++;

        // check if all data is displayed to scroll
        if (this.realDataSource.length > this.dataSource.length) {
          // starting index to start the loop at
          const startIndex = (this.rowsPerPage - 1);
          // ending index to end the loop at
          const endIndex = this.rowsPerPage * this.pagingIndexForScroll;
          // store data source from real data source
          const newDataSource = [];
          for (let i = startIndex; i < endIndex; i++) {
            newDataSource.push(this.realDataSource[i]);
          }
          // make a copy of data source table is having
          const copiedDataSource = [...this.dataSource];
          // concat previous data source and current data source
          const concattedDataSource = copiedDataSource.concat(newDataSource);
          this.dataSource = concattedDataSource;
        }
        return;
      }
      return;
    }
    return;
  }

  // on every row click get the object
  onRowClick(this: NgxGridComponent, i: number, last: number): void {
    // make a copy of the selected row object
    const selectedRow = { ...this.dataSource[last] };
    // check for empty string key and delete it and send it to the lib user
    const keys = Object.keys(selectedRow);
    if (keys.indexOf('') !== -1) {
      delete selectedRow[''];
    }
    this.rowClick.emit(selectedRow);
    return;
  }

  onFiltering(searchStr: string): void {
    // check for empty string
    if (searchStr !== '') {
      // string to test a pattern
      const regex = RegExp(`${searchStr}`);
      // store the row indexes
      const filteredArr = [];
      // make a copy of real data source
      const copiedRealDataSource = [...this.realDataSource];
      // storing data for filtering
      const storeDataSourceAfterFilter = [];

      // make a copy of search bucket
      const copiedSearchBucket = [...this.searchBucket];
      // loop through the search bucket to check if regex pattern passes the test
      for (let i = 0; i < copiedSearchBucket.length; i++) {
        // regex test
        if (regex.test(copiedSearchBucket[i].char)
          && filteredArr.indexOf(copiedSearchBucket[i].rowIndex) === -1) {
          // store all selected array in the filter arr
          filteredArr.push(copiedSearchBucket[i].rowIndex);
        }
      }
      // loop through the indexes and filter the real data source
      for (let i = 0; i < filteredArr.length; i++) {
        storeDataSourceAfterFilter.push(copiedRealDataSource[filteredArr[i]]);
      }
      // console.log('stored data source', storeDataSourceAfterFilter);
      this.dataSource = storeDataSourceAfterFilter;
    } else {
      // use the current page data property to display the data when search is stopped by user
      this.dataSource = this.dataOnCurrentPage;
    }

    return;

  }

  dataBucket(): void {

    const newColumn = [...this.columns];
    // convert '' to a special character and then hide it in the template
    if (newColumn.indexOf('')) {
      newColumn.splice(-1, 1);
    }

    let searchBucketObj: SearchModel;
    // loop through the data source array to get all the words stored in search bucket
    // make a copy of copied data source
    const copiedRealDataSource = [...this.realDataSource];

    for (let i = 0; i < copiedRealDataSource.length; i++) {
      for (let j = 0; j < newColumn.length; j++) {
        searchBucketObj = {
          char: typeof copiedRealDataSource[i][newColumn[j]] === 'string'
            ? copiedRealDataSource[i][newColumn[j]].toLowerCase()
            : copiedRealDataSource[i][newColumn[j]],
          rowIndex: i
        };
        this.searchBucket.push(searchBucketObj);
      }
    }
    return;
  }

  /* quick sort implementation */
  sortByColumn(column: string): void {
    /* quick sort */
    // make a copy of data source array
    const toSortDataSource = [...this.dataSource];
    toSortDataSource.shift();

    methods.quickSort(toSortDataSource, column, 0, toSortDataSource.length - 1);

    this.dataSource = methods._finalDataSet;
    return;
  }

  onPageChange(selectedPage: number): void {
    // console.log('selected page', selectedPage);
    this.isDisabled = false;

    // emit a event to support server side paging strategy
    // only if clientRendering is false
    if (!this.clientRendering) {
      this.pageChange.emit({ index: selectedPage });
      return;
    }

    this.selectedIndex = selectedPage;

    this.changeDetectorRef.detectChanges();

    // find the currently selected index
    const index = this.totalPages.indexOf(this.onSelectPage);

    this.onSelectPage = this.totalPages[index + 1];

    // get the data for current page
    this.getCurrentPage(selectedPage);

    return;
  }

  // for left navigation
  onNavLeft(): void {

    this.selectedIndex--;
    // emit a event to support server side paging strategy
    if (!this.clientRendering) {
      this.pageChange.emit({
        index: this.selectedIndex,
        left: true
      });
      // find the currently selected index
      const index = this.totalPages.indexOf(this.onSelectPage);
      // Move the rendered element to the previous index - this will cause the current
      // item to enter the ( "prev" => "void" ) transition and this new item to enter
      // the ( "void" => "prev" ) transition.

      this.onSelectPage = this.totalPages[index - 1]
        ? this.totalPages[index - 1]
        : this.totalPages[this.totalPages.length - 1];
      return;
    } else {
      // set selectedPage value to set active class on current tab
      this.selectedPage = this.selectedIndex;

      // // change the state for our animation trigger
      // this.orientation = 'prev';

      // Force the Template to apply the new animation state before we actually
      // change the rendered element view-model. If we don't force a change-detection,
      // the new [@orientation] state won't be applied prior to the "leave" transition;
      // which means that we won't be leaving from the "expected" state.
      this.changeDetectorRef.detectChanges();

      // get the data for current page
      this.getCurrentPage(this.selectedIndex);

      // decrement the array for paginator options till it find 1 in the array
      if (this.totalPages.indexOf(1) === -1) {
        this.totalPages = this.totalPages.map((x) => x - 1);
      }

      return;
    }
  }

  // for right navigation
  onNavRight(): void {

    this.selectedIndex++;

    if (!this.clientRendering) {
      // emit a event to support server side paging strategy
      this.pageChange.emit({
        index: this.selectedIndex,
        right: true
      });
      // find the currently selected index
      const index = this.totalPages.indexOf(this.onSelectPage);
      // Move the rendered element to the next index - this will cause the current item
      // to enter the ( "next" => "void" ) transition and this new item to enter the
      // ( "void" => "next" ) transition.
      this.onSelectPage = this.totalPages[index + 1]
        ? this.totalPages[index + 1]
        : this.totalPages[0];

      return;

    } else {
      // set selectedPage value to set active class on current tab
      this.selectedPage = this.selectedIndex;
      // change the state for our animation trigger
      // this.orientation = 'next';

      // Force the Template to apply the new animation state before we actually
      // change the rendered element view-model. If we don't force a change-detection,
      // the new [@orientation] state won't be applied prior to the "leave" transition;
      // which means that we won't be leaving from the "expected" state.
      this.changeDetectorRef.detectChanges();
      // increment the array for paginator options
      this.totalPages = this.totalPages.map((x) => x + 1);

      // get the data for current page
      this.getCurrentPage(this.selectedIndex);

      return;
    }
  }

  getCurrentPage(numberOfPage: number): void {
    // get starting index to start loop
    const startIndex = (numberOfPage - 1) * this.rowsPerPage;
    // get end index to end loop
    let endIndex;
    if (this.realDataSource.length < (numberOfPage * this.rowsPerPage)) {
      endIndex = this.realDataSource.length;
    } else {
      endIndex = numberOfPage * this.rowsPerPage;
    }
    // store the current page data in following constant
    const pagedDataForTable = [];
    for (let i = startIndex; i < endIndex; i++) {
      pagedDataForTable.push(this.realDataSource[i]);
    }
    // update dataSource property of the component
    this.dataSource = pagedDataForTable;

    return;
  }

  ngOnDestroy(): void {
    // unsubscribe to ngFor subscriber
    this.ngForChanges$.unsubscribe();
  }
}
