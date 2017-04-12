
angular.module('User').service("UserService", function ($http, $q) {

    function getList() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/users/",
            method: "GET",
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                return response.data;
            },
            function (response) {
                if (response.status >= 0) {
                    console.log("error");
                    console.log(response);
                    return ($q.reject("error"));
                }
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
        getList: getList
    }
});