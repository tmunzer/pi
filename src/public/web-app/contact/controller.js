angular.module('Contact').controller('ContactListCtrl', function ($scope, $routeParams, $mdDialog, ContactService) {

    $scope.refreshRequested = true;
    $scope.refresh = function () {
        $scope.refreshRequested = true;
    }

});