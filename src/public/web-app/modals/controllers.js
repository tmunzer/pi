angular.module('Modals').controller("ErrorService", function ($scope, $mdDialog, items) {
    $scope.error = items;

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

angular.module('Modals').controller('NewComment', function ($scope, $mdDialog, items) {

    $scope.object = items.object;
    const service = items.service;
    $scope.comment = "";
    function displayError(error) {
        console.log(error);
        $mdDialog.show({
            controller: 'ErrorCtrl',
            templateUrl: 'modals/error.html',
            locals: {
                items: error
            }
        });
    }

    $scope.reset = function () {
        $scope.comment = "";
    }

    $scope.save = function () {
        service.postComment($scope.object._id, $scope.comment).then(function (promise) {
            if (promise && promise.error) console.log(promise.error);
            else $mdDialog.hide(promise);
        })
    }


    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});