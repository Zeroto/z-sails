z-sails
=======

A httpBackend replacement for angular to easily use sails socket requests. This allows you to use normal $http in angular but it will use sails socket implementation when possible.

## Install:

    bower install z-sails

## Usage:

Load `dist/z-sails.min.js` in your main html.

Add "z-sails" to your module dependency list.

z-sails will automatically work after that. You can use normal $http calls.

## Configuration

Because $http is also used to load template files which are not exposed by sails, it has a few configurable stategies to fallback to normal $http/XHR to load those files. To configure z-sails, inject `zSails` into a config block.

    module.config(function(zSails){
	    zSails.useFileCheck = true;
		zSails.useFallback = false;
	});

By default useFileCheck is turned on and useFallback is turned off.
	
### zSails.useFileCheck

default: true

This strategy checks the url to see if the 3rd or 4th last character is a '.'. If that is the case, it will assume it is loading a normal file and will use normal $http/XHR to load it.

### zSails.useFallback

default: false

This strategy first tries to get the url through sails socket requests. If this fails(e.g. 404 status) it will try again using $http/XHR.

## Tests

### Unit-tests

When unit-testing your modules we need to make sure we have access to the mocked $httpBackend. Because of how angular-mocks works(it forces ng and ngMock to load before other modules), z-sails' $httpBackend replaces the mocked $httpBackend. To fix this you will need to load z-sails-mock.js and add the following line to your tests:

    beforeEach(module('z-sails-mock'));

This will put back the angular-mocks' $httpBackend.

### E2E tests

During E2E tests no changes should be needed except the normal ones.