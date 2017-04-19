
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

angular.module('Hardware').service("HardwareService", function ($http, $q, $mdDialog, ErrorService) {
    function edit(hardware, cb) {
        hardware = angular.copy(hardware);
        return $mdDialog.show({
            controller: 'HardwareEditCtrl',
            controllerAs: 'hardwareEdit',
            templateUrl: 'hardware/edit.html',
            locals: {
                items: hardware
            }
        }).then(function () {
            cb();
        });
    }
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
    function getById(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/hardwares",
            method: "GET",
            params: { id: id },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function remove(id, cb) {
        return $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Hardware" }
            }
        }).then(function () {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/hardwares/" + id,
                method: "DELETE",
                timeout: canceller.promise
            });
            httpReq(request).then(function (promise) {
                cb();
            });;
        })
    }

    function httpReq(request) {
        var canceller = $q.defer();
        request.timout = canceller.promise;
        var promise = request.then(
            function (response) {
                return response.data;
            },
            function (response) {
                if (response.status >= 0) ErrorService.display(response.data);
            });

        promise.abort = function () {
            canceller.resolve("aborted");
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        edit: edit,
        create: create,
        getList: getList,
        remove: remove,
        get: get,
        getById: getById
    }
});


