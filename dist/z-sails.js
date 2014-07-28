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
				// build request options
				var options = {
					method: methodLowercase,
					url: url,
					headers: headers,
					data: angular.fromJson(post)
				};
				$window.io.socket._request(options, function(data, jwr){
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
(function(module){
	'use strict';

	module.provider('$httpXHRBackend', $HttpBackendProvider);

	var lowercase = angular.lowercase;
	var forEach = angular.forEach;
	var isDefined = angular.isDefined;
	var isFunction = angular.isFunction;
	var noop = angular.noop;
	
	
	// copied from angular.js
	/**
	 * IE 11 changed the format of the UserAgent string.
	 * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
	 */
	var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
	if (isNaN(msie)) {
	  msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
	}
	
	var addEventListenerFn = (window.document.addEventListener
      ? function(element, type, fn) {element.addEventListener(type, fn, false);}
      : function(element, type, fn) {element.attachEvent('on' + type, fn);});
    var removeEventListenerFn = (window.document.removeEventListener
      ? function(element, type, fn) {element.removeEventListener(type, fn, false); }
      : function(element, type, fn) {element.detachEvent('on' + type, fn); });
	
	function isPromiseLike(obj) {
	  return obj && isFunction(obj.then);
	}
	
	function int(str) {
	  return parseInt(str, 10);
	}
	
	
	// below is a copy of $httpBackend from the angular source. This will require updating when this updates in angular, but it is a low maintenance file, so this will not happen often.

	function createXhr(method) {
		//if IE and the method is not RFC2616 compliant, or if XMLHttpRequest
		//is not available, try getting an ActiveXObject. Otherwise, use XMLHttpRequest
		//if it is available
		if (msie <= 8 && (!method.match(/^(get|post|head|put|delete|options)$/i) ||
		  !window.XMLHttpRequest)) {
		  return new window.ActiveXObject("Microsoft.XMLHTTP");
		} else if (window.XMLHttpRequest) {
		  return new window.XMLHttpRequest();
		}

		throw minErr('$httpBackend')('noxhr', "This browser does not support XMLHttpRequest.");
	}

	/**
	* @ngdoc service
	* @name $httpBackend
	* @requires $window
	* @requires $document
	*
	* @description
	* HTTP backend used by the {@link ng.$http service} that delegates to
	* XMLHttpRequest object or JSONP and deals with browser incompatibilities.
	*
	* You should never need to use this service directly, instead use the higher-level abstractions:
	* {@link ng.$http $http} or {@link ngResource.$resource $resource}.
	*
	* During testing this implementation is swapped with {@link ngMock.$httpBackend mock
	* $httpBackend} which can be trained with responses.
	*/
	function $HttpBackendProvider() {
	  this.$get = ['$browser', '$window', '$document', function($browser, $window, $document) {
		return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0]);
	  }];
	}

	function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {
	  var ABORTED = -1;

	  // TODO(vojta): fix the signature
	  return function(method, url, post, callback, headers, timeout, withCredentials, responseType) {
		var status;
		$browser.$$incOutstandingRequestCount();
		url = url || $browser.url();

		if (lowercase(method) == 'jsonp') {
		  var callbackId = '_' + (callbacks.counter++).toString(36);
		  callbacks[callbackId] = function(data) {
			callbacks[callbackId].data = data;
			callbacks[callbackId].called = true;
		  };

		  var jsonpDone = jsonpReq(url.replace('JSON_CALLBACK', 'angular.callbacks.' + callbackId),
			  callbackId, function(status, text) {
			completeRequest(callback, status, callbacks[callbackId].data, "", text);
			callbacks[callbackId] = noop;
		  });
		} else {

		  var xhr = createXhr(method);

		  xhr.open(method, url, true);
		  forEach(headers, function(value, key) {
			if (isDefined(value)) {
				xhr.setRequestHeader(key, value);
			}
		  });

		  // In IE6 and 7, this might be called synchronously when xhr.send below is called and the
		  // response is in the cache. the promise api will ensure that to the app code the api is
		  // always async
		  xhr.onreadystatechange = function() {
			// onreadystatechange might get called multiple times with readyState === 4 on mobile webkit caused by
			// xhrs that are resolved while the app is in the background (see #5426).
			// since calling completeRequest sets the `xhr` variable to null, we just check if it's not null before
			// continuing
			//
			// we can't set xhr.onreadystatechange to undefined or delete it because that breaks IE8 (method=PATCH) and
			// Safari respectively.
			if (xhr && xhr.readyState == 4) {
			  var responseHeaders = null,
				  response = null,
				  statusText = '';

			  if(status !== ABORTED) {
				responseHeaders = xhr.getAllResponseHeaders();

				// responseText is the old-school way of retrieving response (supported by IE8 & 9)
				// response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
				response = ('response' in xhr) ? xhr.response : xhr.responseText;
			  }

			  // Accessing statusText on an aborted xhr object will
			  // throw an 'c00c023f error' in IE9 and lower, don't touch it.
			  if (!(status === ABORTED && msie < 10)) {
				statusText = xhr.statusText;
			  }

			  completeRequest(callback,
				  status || xhr.status,
				  response,
				  responseHeaders,
				  statusText);
			}
		  };

		  if (withCredentials) {
			xhr.withCredentials = true;
		  }

		  if (responseType) {
			try {
			  xhr.responseType = responseType;
			} catch (e) {
			  // WebKit added support for the json responseType value on 09/03/2013
			  // https://bugs.webkit.org/show_bug.cgi?id=73648. Versions of Safari prior to 7 are
			  // known to throw when setting the value "json" as the response type. Other older
			  // browsers implementing the responseType
			  //
			  // The json response type can be ignored if not supported, because JSON payloads are
			  // parsed on the client-side regardless.
			  if (responseType !== 'json') {
				throw e;
			  }
			}
		  }

		  xhr.send(post || null);
		}

		if (timeout > 0) {
		  var timeoutId = $browserDefer(timeoutRequest, timeout);
		} else if (isPromiseLike(timeout)) {
		  timeout.then(timeoutRequest);
		}


		function timeoutRequest() {
		  status = ABORTED;
		  jsonpDone && jsonpDone();
		  xhr && xhr.abort();
		}

		function completeRequest(callback, status, response, headersString, statusText) {
		  // cancel timeout and subsequent timeout promise resolution
		  timeoutId && $browserDefer.cancel(timeoutId);
		  jsonpDone = xhr = null;

		  // fix status code when it is 0 (0 status is undocumented).
		  // Occurs when accessing file resources or on Android 4.1 stock browser
		  // while retrieving files from application cache.
		  if (status === 0) {
			status = response ? 200 : urlResolve(url).protocol == 'file' ? 404 : 0;
		  }

		  // normalize IE bug (http://bugs.jquery.com/ticket/1450)
		  status = status === 1223 ? 204 : status;
		  statusText = statusText || '';

		  callback(status, response, headersString, statusText);
		  $browser.$$completeOutstandingRequest(noop);
		}
	  };

	  function jsonpReq(url, callbackId, done) {
		// we can't use jQuery/jqLite here because jQuery does crazy shit with script elements, e.g.:
		// - fetches local scripts via XHR and evals them
		// - adds and immediately removes script elements from the document
		var script = rawDocument.createElement('script'), callback = null;
		script.type = "text/javascript";
		script.src = url;
		script.async = true;

		callback = function(event) {
		  removeEventListenerFn(script, "load", callback);
		  removeEventListenerFn(script, "error", callback);
		  rawDocument.body.removeChild(script);
		  script = null;
		  var status = -1;
		  var text = "unknown";

		  if (event) {
			if (event.type === "load" && !callbacks[callbackId].called) {
			  event = { type: "error" };
			}
			text = event.type;
			status = event.type === "error" ? 404 : 200;
		  }

		  if (done) {
			done(status, text);
		  }
		};

		addEventListenerFn(script, "load", callback);
		addEventListenerFn(script, "error", callback);
		rawDocument.body.appendChild(script);
		return callback;
	  }
	}
})(angular.module('z-sails'));