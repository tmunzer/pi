
angular.module('Hardware').service("HardwareTypeService", function () {
    var hardwareType = [
        "Access Point",
        "Switch",
        "Branch Router",
        "Physical Appliance",
        "Other"
    ];
    return {
        getHardwareType: function () {
            return hardwareType;
        }
    }
});

angular.module('Hardware').service("HardwareService", function ($http, $q) {

    function create(hardware) {
        let id;
        if (hardware._id) id = hardware._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/hardwares/" + id,
            method: "POST",
            data: { hardware: hardware },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getList(search) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/hardwares",
            method: "GET",
            params: search,
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function get(model) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/hardwares/" + model,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function remove(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/hardwares/" + id,
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


