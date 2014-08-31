angular.module('modelvizDirectives',[]).directive('resizeMe', ['$timeout', function($timeout) {
    return  function (scope,element) {    		
        var resize = function(){       
            element[0].style.height = scope.height + 'px';
            element[0].style.width = scope.width + 'px';
        	scope.diagramstyle = {
        			'height': scope.height+"px",
        			'width': scope.width+"px"			
        	    }
         }
        scope.$on('resizeMe', function(){
           $timeout(resize); //forces it to wait till the next digest
        })
    }
}]).directive('resize', ['$window', function ($window) {
	return function (scope, element) {

		scope.$watch(function () {
			return { 'h': $window.innerHeight, 'w': $window.innerWidth};
		}, function (newValue, oldValue) {
			
			scope.wHeight = newValue.h;
            scope.wWidth = newValue.w;
            
        	scope.diagramstyle = {
		   	  'height': newValue.h+"px",
			  'width': newValue.w+"px"			
        	}

//            scope.style = function () {
//				return { 
//                    'height': (newValue.h - 100) + 'px',
//                    'width': (newValue.w - 100) + 'px' 
//                };
//			};
            
		}, true);
	
		
		angular.element($window).bind('resize', function () {
			scope.$apply();
		});
	}
}])
;