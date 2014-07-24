describe("z-sails", function(){
	
	beforeEach(module('z-sails'));
	
	var $http, zSails, $httpBackend, $window, socket, $rootScope;
	beforeEach(inject(['$injector', function($injector){
		$http = $injector.get('$http');
		$httpBackend = $injector.get('$httpBackend').originalBackend;
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
	
	afterEach(function() {
         $httpBackend.verifyNoOutstandingExpectation();
         $httpBackend.verifyNoOutstandingRequest();
       });
	
	it ('should use XHR when requesting a file when using the filecheck strategy', function(){
		
		zSails.useFileCheck = true;
		zSails.useFallback = false;
		
		$httpBackend.expectGET('/template.html').respond(200, '');
		$http({url: '/template.html', method: 'GET'});
		
		$httpBackend.flush();
	});
	
	it ('should use sockets when requesting a resource when using the filecheck strategy', function(){
		
		zSails.useFileCheck = true;
		zSails.useFallback = false;
		
		spyOn(socket, "get").andCallThrough();
				
		$http({url: '/resource', method: 'GET'}).finally(function(){
			expect(socket.get).toHaveBeenCalled();
		});
		
		$rootScope.$digest();
	});
	
	it ('should use sockets and XHR when using the fallback strategy', function(){
		
		zSails.useFileCheck = false;
		zSails.useFallback = true;
		
		spyOn(socket, "get").andCallThrough();
				
		$httpBackend.expectGET('/template.html').respond(200, '');
		
		$http({url: '/template.html', method: 'GET'}).finally(function(){
			expect(socket.get).toHaveBeenCalled();
		});
		
		$httpBackend.flush();
		$rootScope.$digest();
	});
	
	it ('should use sockets and XHR when using both strategies when requesting a resource', function(){
		
		zSails.useFileCheck = true;
		zSails.useFallback = true;
		
		spyOn(socket, "get").andCallThrough();
				
		$httpBackend.expectGET('/resource').respond(200, '');
		
		$http({url: '/resource', method: 'GET'}).finally(function(){
			expect(socket.get).toHaveBeenCalled();
		});
		
		$httpBackend.flush();
		$rootScope.$digest();
	});
}); 