angular.module('Device').service("DevicesToReplace", function ($http, $q) {

    function getList(modelId) {
        console.log({ modelId: modelId });
        var canceller = $q.defer();
        var request = $http({
            url: "/api/devices/replace/",
            method: "GET",
            params: { modelId: modelId },
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


angular.module('Device').service("DeviceService", function ($http, $q) {

    function create(device) {
        let id;
        if (device._id) id = device._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/devices/" + id,
            method: "POST",
            data: { device: device },
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
        else queryParam = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/devices" + queryParam,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    
    function get(serialNumber) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/devices/" + serialNumber,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }


    function remove(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/devices/" + id,
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
        get: get,
        remove: remove
    }
});


