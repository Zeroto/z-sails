/**
 * Created by Sander Homan on 7/23/14.
 */

 angular.module('z-sails', []);
 
(function(module){

    module.provider('zSails', [function(){
        var self = this;
        self.useFileCheck = true;
        self.useFallback = false;

        this.$get = function(){
            return {
                useFileCheck: self.useFileCheck,
                useFallback: self.useFallback
            };
        };
    }]);
    module.factory('$httpBackend', ['$httpXHRBackend', '$browser', 'zSails', '$window', function($httpXHRBackend, $browser, zsails, $window){
		var $httpBackend = function(method, url, post, callback, headers, timeout, withCredentials, responseType){
			url = url || $browser.url();

			var lowercaseUrl;
			if (zsails.useFileCheck)
				lowercaseUrl = angular.lowercase(url);

			var methodLowercase = angular.lowercase(method);
			if ((methodLowercase !== 'get' && methodLowercase !== 'post' && methodLowercase !== 'put' && methodLowercase !== 'delete') ||
				(zsails.useFileCheck && lowercaseUrl.length > 5 && (lowercaseUrl[lowercaseUrl.length-5] == '.' || lowercaseUrl[lowercaseUrl.length-4] == '.'))) //check if file. files will have a . at 3rd or 4th last character
			{
				return $httpXHRBackend(method, url, post, callback, headers, timeout, withCredentials, responseType);
			}
			else
			{
				$window.io.socket[methodLowercase](url, angular.fromJson(post), function(data, jwr){
					if (zsails.useFallback && jwr.statusCode != 200)
					{
						$httpXHRBackend(method, url, post, callback, headers, timeout, withCredentials, responseType);
					}
					else
						callback(jwr.statusCode, data, jwr.headers, "");
				});
			}
		};
		
		return $httpBackend;
	}]);

})(angular.module('z-sails'));