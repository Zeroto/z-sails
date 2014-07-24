/**
 * Created by Zerot on 7/23/14.
 */

(function(module){

    module.provider('z-sails', [function(){
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
    module.config(['$provide', function($provide){

        // replace $httpBackend to have it put out sails socket requests instead of XHR
        $provide.decorator('$httpBackend', ['$delegate', '$browser', 'z-sails', function($delegate, $browser, zsails){
            var $httpBackend = function(method, url, post, callback, headers, timeout, withCredentials, responseType){
                $browser.$$incOutstandingRequestCount();
                url = url || $browser.url();

                var lowercaseUrl;
                if (zsails.useFileCheck)
                    lowercaseUrl = angular.lowercase(url);

                method = angular.lowercase(method);
                if ((method !== 'get' && method !== 'post' && method !== 'put' && method !== 'delete') ||
                    (zsails.useFileCheck && lowercaseUrl.length > 5 && (lowercaseUrl[lowercaseUrl.length-5] == '.' || lowercaseUrl[lowercaseUrl.length-4] == '.'))) //check if file. files will have a . at 3rd or 4th last character
                {
                    return $delegate(method, url, post, callback, headers, timeout, withCredentials, responseType);
                }
                else
                {
                    io.socket[method](url, angular.fromJson(post), function(data, jwr){
                        console.log(jwr);
                        if (zsails.useFallback && jwr.statusCode != 200)
                        {
                            $delegate(method, url, post, callback, headers, timeout, withCredentials, responseType);
                        }
                        else
                            callback(jwr.statusCode, data, jwr.headers, "");
                    });
                }

            };

            return $httpBackend;
        }]);

    }]);

})(angular.module('z-sails', []));