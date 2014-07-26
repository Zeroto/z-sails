describe("z-sails", function(){
	
	beforeEach(module('z-sails'));
	beforeEach(module('z-sails-mock'));
	
	var $http, zSails, $httpBackend, $window, socket, $rootScope, $httpXHRBackend;
	beforeEach(inject(['$injector', function($injector){
		$http = $injector.get('$http');
		$httpBackend = $injector.get('$httpBackend');
		
		$window = $injector.get('$window');
		$rootScope = $injector.get('$rootScope');
		
		// set up the mock socket
		socket = {
			get: function(_, _, cb){cb(null, {statusCode: 404, headers: null})},
			post: function(_, _, cb){cb(null, {statusCode: 404, headers: null})},
			put: function(_, _, cb){cb(null, {statusCode: 404, headers: null})},
			delete: function(_, _, cb){cb(null, {statusCode: 404, headers: null})},
		}
		
		$window.io = {
			socket: socket
		};
	}]));
	
	beforeEach(inject(['$injector', function($injector){
		zSails = $injector.get('zSails');
	}]));
	
	afterEach(function(){
		$httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
	});
	
	it ('should use the Mock $httpBackend', function(){
		
		zSails.useFileCheck = true;
		zSails.useFallback = false;
		
		$httpBackend.expectGET('/template.html').respond(200, '');
		$http({url: '/template.html', method: 'GET'});
		
		$httpBackend.flush();
		$rootScope.$digest();
	});
}); 