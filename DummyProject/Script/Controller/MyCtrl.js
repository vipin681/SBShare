var app = angular.module("MyAppVe", ['ui.bootstrap']);
app.controller("DroCtrl", function ($scope, $http, $modal, $rootScope, $window, $log, $timeout) {
    alert("Piyush Sharma");
    
    $scope.BindDrop = {};
    function GetCountries() {
        $http({
            method: 'Get',
            url: VirtualDirectoryPath + 'api/User/GetCountryList',
        }).success(function (data, status, headers, config) {
            $scope.Getcountries = data;
            console.log($scope.Getcountries.Results[0].CountryName);
        }).error(function (data, status, headers, config) {
            $scope.message = 'Unexpected Error';
        });
    }
    $http.get(VirtualDirectoryPath + 'api/User/GetCountryList').success(function (data) {
        $scope.BindDropDown = data;
        console.log($scope.BindDropDown);
    });

});