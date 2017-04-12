angular.module('Modals').controller("ErrorService", function ($scope, $mdDialog, items) {
    $scope.error = items;

    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});




angular.module('Modals').controller('ConfirmCtrl', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.item = items.item;
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});