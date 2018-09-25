
angular.module('Modals').controller("ErrorCtrl", function ($scope, $mdDialog, items) {

    $scope.message = items;

    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});




angular.module('Modals').controller('ConfirmCtrl', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.items = items;
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});
angular.module('Modals').controller('ConfirmReturnCtrl', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.loan = items;
    $scope.minDate = new Date($scope.loan.startDate);
    $scope.loan.endDate = new Date();
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide($scope.loan);
    }
});

angular.module('Modals').controller('NewComment', function ($scope, $mdDialog, items, ErrorService) {

    $scope.object = items.object;
    const service = items.service;
    $scope.comment = "";

    $scope.reset = function () {
        $scope.comment = "";
    }

    $scope.save = function () {
        service.postComment($scope.object._id, $scope.comment).then(function (promise) {
            $mdDialog.hide(promise);
            if (promise && promise.error) ErrorService.display(promise.error);
        })
    }


    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});