angular.module('User').controller('UsersListCtrl', function ($scope, $routeParams, $mdDialog, UserService) {

    $scope.users = [];
    $scope.displayedUsers = [];
    $scope.query = {
        order: "name.first",
        limit: 10,
        page: 1,
        pageSelect: 1,
        filter: ""
    }
    $scope.request;
    $scope.$watch("query.filter", function () {
        filter();
    })
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

    function filter() {
        $scope.displayedUsers = [];
        $scope.users.forEach(function (user) {
            if ($scope.query.filter == ""
                || user.name.first.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                || user.name.last.toLowerCase().indexOf($scope.query.filter) >= 0
                || user.email.toLowerCase().indexOf($scope.query.filter) >= 0)
                $scope.displayedUsers.push(user);
        })
    }

    $scope.editLoan = function (loan) {
        $mdDialog.show({
            controller: 'UserEditCtrl',
            templateUrl: 'user/edit.html',
            locals: {
                items: null
            }
        }).then(function () {
            $scope.refresh();
        });
    }

    $scope.refresh = function () {
        $scope.request = UserService.getList();
        $scope.request.then(function (promise) {
            if (promise && promise.error) displayError(promise);
            else {
                $scope.users = promise.users;
                filter();
            }
        });
    }

    $scope.refresh();
});