'use strict';

describe('Main View', function() {
  var page;

  beforeEach(function() {
    browser.get('/signup');
    page = require('./signup.po');
  });

    it('should connect', function() {
        page.name.sendKeys('Titi');
        page.email.sendKeys('titi@titi.com');
        page.password.sendKeys('titi');
        page.goButton.click().then(function(){
            browser.waitForAngular();
            expect(browser.getLocationAbsUrl()).toBe('/');
            expect(page.userName.getText()).toBe('Titi');
        });
    });
});
