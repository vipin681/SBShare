var myApp = angular.module('myApp', []);
myApp.controller('myController', function ($scope, $http) {

    var arrBooks = new Array();
    $http.get(VirtualDirectoryPath + 'api/User/Get').success(function (data) {

        $.map(data, function (item) {
            arrBooks.push(item.BookName);
        });

        $scope.list = arrBooks;
    }).error(function (status) {
        alert(status);
    });
});