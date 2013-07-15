function mainCtrl($scope, $http, $location){
  if ($location.search()['search_histo_name'] == 'true'){
    $scope.search_by_histogram_name = true;
  }else{
      if ($location.search()['search_histo_name'] === undefined){
        $scope.search_by_histogram_name = true;
      }else{
        $scope.search_by_histogram_name = false;
      }
  }
  $scope.getInfo = function(){
    var promise = $http.get('/report/'+$scope.selectedRelease+"/"+$scope.search_field+"/"+$scope.search_by_histogram_name)
    promise.then(function(data){
      if (data.data.error === undefined){
        $scope.histogram_info = data.data.data;
        $scope.results_length = _.keys($scope.histogram_info).length;
      }else{
        alert("Error while processing: "+ data.data.error);
      }
    },function(data){
      alert("Error "+data);
    });
  };

  if($location.search()["release"]){
    $scope.selectedRelease = $location.search()["release"];
  }
  if($location.search()["search"]){
    $scope.search_field = $location.search()["search"];
    $scope.getInfo();
  }
  $scope.releases = "CMSSW_X_Y_Z";
  var promise = $http.get('/list_reports');
  promise.then(function(data){
    $scope.releases = data.data.results;
  }, function(data){
    alert("Error "+data);
  });

  $scope.$watch('selectedRelease',function(){
   if($scope.selectedRelease){
     $location.search('release',$scope.selectedRelease);
   }
  });
  $scope.$watch('search_field', function(){
   if($scope.search_field){
     $location.search('search', $scope.search_field);
   }
  });
  $scope.$watch('search_by_histogram_name', function(){
    if ($scope.search_by_histogram_name){
      $location.search('search_histo_name', 'true');
    }else{
      $location.search('search_histo_name', 'false');
    }
  });
  $scope.toggleCollapse = function(isCollapsed){
    if(isCollapsed){
      return false
    }else{
      return true
    }
  };
  //watch length of pending HTTP requests -> if there are display loading;
  $scope.$watch(function(){ return $http.pendingRequests.length;}, function(v){
    $scope.pendingHTTPLenght = v;
    if (v == 0){  //if HTTP requests pending == 0
      $scope.pendingHTTP = false;
    }else
      $scope.pendingHTTP = true;
  });
};
var histoApp = angular.module('histoApp', []).config(function($locationProvider){$locationProvider.html5Mode(true);});

histoApp.directive("customHistoLog", function($rootScope){
  return{
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    link: function(scope, element, attr, ctrl){
      ctrl.$render = function(){
        scope.histo_data = ctrl.$viewValue;
        scope.histo_name = scope.$eval(attr.histoname);
        scope.is_collapsed = true;
      }
      scope.toggleCollapse = function(){
        if (scope.is_collapsed){
          scope.is_collapsed = false;
        }else{
          scope.is_collapsed = true;
        }
      };
    },
    template: '<div>'+
    '<a ng-click="toggleCollapse()" ng-href="#"> <b>{{elem}}</b></a>'+
    '<div ng-show="!is_collapsed">'+
    '  <pre>{{histo_data.join("\n")}}</pre>'+
    '</div>'+
    '</div>'
  };
});