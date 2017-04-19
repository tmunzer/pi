
angular.module('User').service("UserService", function ($http, $q, $mdDialog, ErrorService) {
    function lock(user, cb) {
        user = angular.copy(user);
        return $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmLock.html',
            locals: {
                items: { action: "lock", user: user.email }
            }
        }).then(function () {
            user.enabled = false;
            create(user).then(function (promise) {
                if (promise) cb();
            });
        });
    }
    function unlock(user, cb) {
        user = angular.copy(user);
        return $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmLock.html',
            locals: {
                items: { action: "unlock", user: user.email }
            }
        }).then(function () {
            user.enabled = true;
            create(user).then(function (promise) {
                if (promise) cb();
            });
        });
    }
    function edit(user, cb) {
        user = angular.copy(user);
        return $mdDialog.show({
            controller: 'UserEditCtrl',
            controllerAs: 'userEdit',
            templateUrl: 'user/edit.html',
            locals: {
                items: user
            }
        }).then(function (promise) {
            cb();
        });
    }
    function password(user) {
        user = angular.copy(user);
        return $mdDialog.show({
            controller: 'PasswordCtrl',
            controllerAs: 'password',
            templateUrl: 'user/password.html',
            locals: {
                items: { user: user }
            }
        });
    }
    function create(user) {
        let id;
        if (user._id) id = user._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/users/" + id,
            method: "POST",
            data: { user: user },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function changePassword(id, password) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/users/" + id + "/password",
            method: "POST",
            data: { password: password },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function getById(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/users",
            method: "GET",
            params: { id: id },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getList() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/users/",
            method: "GET",
            timeout: canceller.promise
        }); return httpReq(request);
    }

    function httpReq(request) {
        var promise = request.then(
            function (response) {
                return response.data;
            },
            function (response) {
                if (response.status >= 0) ErrorService.display(response.data);
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        lock: lock,
        unlock: unlock,
        edit: edit,
        password: password,
        create: create,
        changePassword: changePassword,
        getList: getList,
        getById: getById
    }
});