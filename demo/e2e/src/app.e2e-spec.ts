import { NgxSleekDemoPage } from './app.po';

describe('ngx-sleek-demo App', () => {
  let page: NgxSleekDemoPage;

  beforeEach(() => {
    page = new NgxSleekDemoPage ();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
