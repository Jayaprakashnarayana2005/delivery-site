// Define the AngularJS module
var app = angular.module("myApp", []);

// Define the controller
app.controller("myController", function($scope) {
    // This is the initial value displayed on the page
    $scope.message = "Hello Jayaprakash!";
});