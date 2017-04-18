
angular.module('User').service("UserService", function ($http, $q, ErrorService) {
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
        create: create,
        changePassword: changePassword,
        getList: getList,
        getById: getById
    }
});