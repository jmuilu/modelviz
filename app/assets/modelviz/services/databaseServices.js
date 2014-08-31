angular.module('modelvizServices',[]).factory('attributeAPIservice', function ($http) {
  
	var API = {};
	
	API.getAttribute = function( id ) {
        return $http.get('/attribute',{params: {'identifier': id }})
	}

	return API
}).factory('entityAPIservice', function ($http) {
  
	var API = {};
	
	API.getEntity = function( id, n ) {
        return $http.get('/entity',{params: {'identifier': id ,'neighbours':n}})
	}

	return API
});