describe("z-sails", function(){
	
	beforeEach(module('z-sails'));
	
	beforeEach(module(function($provide){
		$httpXHRBackend = jasmine.createSpy('$httpXHRBackend').and.callFake(function(_,_,_,cb){cb(200, null, null, "");});
		$provide.value('$httpXHRBackend', $httpXHRBackend);
	}));
	
	var $http, zSails, $httpBackend, $window, socket, $rootScope, $httpXHRBackend;
	beforeEach(inject(['$injector', function($injector){
		$http = $injector.get('$http');
		
		
		$window = $injector.get('$window');
		$rootScope = $injector.get('$rootScope');
		
		// set up the mock socket
		socket = {
			_request: function(_, cb){cb(null, {statusCode: 404, headers: null})},
		}
		
		$window.io = {
			socket: socket
		};
	}]));
	
	beforeEach(inject(['$injector', function($injector){
		zSails = $injector.get('zSails');
	}]));
	
	it ('should use XHR when requesting a file when using the filecheck strategy', function(done){
		
		zSails.useFileCheck = true;
		zSails.useFallback = false;
		
		$http({url: '/template.html', method: 'GET'})
			.finally(function(){
				expect($httpXHRBackend).toHaveBeenCalled();
				done();
			});
		
		$rootScope.$digest();
	});
	
	it ('should use sockets when requesting a resource when using the filecheck strategy', function(done){
		
		zSails.useFileCheck = true;
		zSails.useFallback = false;
		
		spyOn(socket, "_request").and.callThrough();
				
		$http({url: '/resource', method: 'GET'}).finally(function(){
			expect(socket._request).toHaveBeenCalled();
			done();
		});
		
		$rootScope.$digest();
	});
	
	it ('should use sockets and XHR when using the fallback strategy', function(done){
		
		zSails.useFileCheck = false;
		zSails.useFallback = true;
		
		spyOn(socket, "_request").and.callThrough();
		
		$http({url: '/template.html', method: 'GET'}).finally(function(){
			expect(socket._request).toHaveBeenCalled();
			expect($httpXHRBackend).toHaveBeenCalled();
			done();
		});

		$rootScope.$digest();
	});
	
	it ('should use sockets and XHR when using both strategies when requesting a resource', function(done){
		
		zSails.useFileCheck = true;
		zSails.useFallback = true;
		
		spyOn(socket, "_request").and.callThrough();
				
		$http({url: '/resource', method: 'GET'}).finally(function(){
			expect(socket._request).toHaveBeenCalled();
			expect($httpXHRBackend).toHaveBeenCalled();
			done();
		});
		
		$rootScope.$digest();
	});
}); 