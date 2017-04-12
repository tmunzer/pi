angular.module('Contact').service("ContactService", function ($http, $q) {
    function create(contact) {
        let id;
        if (contact._id) id = contact._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts/" + id,
            method: "POST",
            data: { contact: contact },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getList(filters) {
        var queryParam;
        if (filters) {
            queryParam = "?";
            for (var key in filters) queryParam = queryParam + key + "=" + filters[key] + "&";
            queryParam = queryParam.substr(0, queryParam.length - 1);
        }
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts" + queryParam,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function get(contact_id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts/" + contact_id,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function remove(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts/" + id,
            method: "DELETE",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function httpReq(request) {
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
        create: create,
        getList: getList,
        remove: remove,
        get: get
    }
});