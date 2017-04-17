angular.module('User').controller('UserListCtrl', function ($scope, $routeParams, $mdDialog, UserService) {

    $scope.users = [];
    $scope.myId;
    $scope.displayedUsers = [];
    $scope.query = {
        order: "name.first",
        limit: 10,
        page: 1,
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

    $scope.edit = function (user) {
        $mdDialog.show({
            controller: 'UserEditCtrl',
            templateUrl: 'user/edit.html',
            locals: {
                items: user
            }
        }).then(function () {
            $scope.refresh();
        });
    }

    $scope.lock = function (user) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmLock.html',
            locals: {
                items: { action: "lock", user: user.email }
            }
        }).then(function () {
            user.enabled = false;
            UserService.create(user).then(function (promise) {
                if (promise.errmsg) displayError(promise);
                else {
                    $scope.refresh();
                }
            });
        });
    }
    $scope.unlock = function (user) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmLock.html',
            locals: {
                items: { action: "unlock", user: user.email }
            }
        }).then(function () {
            user.enabled = true;
            UserService.create(user).then(function (promise) {
                if (promise.errmsg) displayError(promise);
                else {
                    $scope.refresh();
                }
            });
        });
    }

    $scope.refresh = function () {
        $scope.request = UserService.getList();
        $scope.request.then(function (promise) {
            if (promise && promise.error) displayError(promise);
            else {
                $scope.myId = promise.currentUser;
                $scope.users = promise.users;
                filter();
            }
        });
    }

    $scope.refresh();
});


angular.module('User').controller('UserDetailsCtrl', function ($scope, $routeParams, $mdDialog, UserService) {
    $scope.user;
    $scope.devices;
    $scope.loans;
    $scope.query = {
        aborted: true,
        returned: true,
        progress: true,
        overdue: true
    }
    $scope.refreshRequested = false;
    $scope.hideColumn = ['owner'];

    const userId = $routeParams.user_id;
    if ($routeParams.user_id == "me") $scope.me = true;

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

    $scope.edit = function () {
        $mdDialog.show({
            controller: 'UserEditCtrl',
            templateUrl: 'user/edit.html',
            locals: {
                items: $scope.user
            }
        }).then(function (user) {
            $scope.user = user;
        });
    }
    $scope.changePassword = function () {
        $mdDialog.show({
            controller: 'PasswordCtrl',
            templateUrl: 'user/password.html',
            locals: {
                items: { user: $scope.user }
            }
        }).then(function (user) {
            console.log(user);
        });
    }
    UserService.getById(userId).then(function (promise) {
        if (promise.error) displayError(promise);
        else {
            $scope.user = promise;
            $scope.filters = { ownerId: promise._id };
            $scope.refresh();
        }
    });

    $scope.refresh = function () {
        $scope.refreshRequested = true;
    }
});



angular.module('User').controller('UserEditCtrl', function ($scope, $mdDialog, items, UserService) {
    // items is injected in the controller, not its scope!   
    console.log(items)
    if (items && items._id) {
        $scope.action = "Edit";
        var master = items;
    } else {
        $scope.action = "Add";
        var master = { email: "", name: { first: "", last: "" }, password: "", enabled: true };
    }
    $scope.reset = function () {
        $scope.user = angular.copy(master);
    };

    $scope.reset();

    $scope.save = function () {
        UserService.create($scope.user).then(function (promise) {
            if (promise.errmsg) console.log(promise)
            else {
                $mdDialog.hide(promise);
            }
        })
    };
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.close = function (promise) {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide(promise);
    };

});

angular.module('User').controller('PasswordCtrl', function ($scope, $mdDialog, items, UserService) {
    // items is injected in the controller, not its scope!
    $scope.user = items.user;
    $scope.password = "";
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.save = function () {
        UserService.changePassword($scope.user._id, $scope.password).then(function (promise) {
            if (promise && promise.error) console.log(promise.error)
            else $mdDialog.hide(promise);
        })
    }
});