'use strict';

describe('Main View', function() {
  var page;

  beforeEach(function() {
    browser.get('/signup');
    page = require('./signup.po');
  });

    it('should connect', function() {
        page.name.sendKeys('Admin');
        page.email.sendKeys('admin@admin.com');
        page.password.sendKeys('admin');
        page.goButton.click().then(function(){
            browser.waitForAngular();
            expect(browser.getLocationAbsUrl()).toBe('/');
        });
    });
});
