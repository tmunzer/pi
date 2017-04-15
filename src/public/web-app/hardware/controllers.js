angular.module('Hardware').controller('HardwareListCtrl', function ($scope, $routeParams, $mdDialog, HardwareTypeService, HardwareService) {
    $scope.hardwares = [];
    $scope.query = {
        order: "model",
        limit: 10,
        page: 1,
    }
    $scope.request;

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

    $scope.refresh = function () {
        $scope.request = HardwareService.getList();
        $scope.request.then(function (promise) {
            if (promise.error) displayError(promise);
            else {
                $scope.hardwares = promise;
                $scope.hardwaresSearch = promise;
            }
        });
    }

    $scope.editHardware = function (hardware) {
        $mdDialog.show({
            controller: 'HardwareEditCtrl',
            templateUrl: 'hardware/edit.html',
            locals: {
                items: hardware
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.copyHardware = function (hardware) {
        const clonedHardware = angular.copy(hardware);
        delete clonedHardware._id;
        $mdDialog.show({
            controller: 'HardwareEditCtrl',
            templateUrl: 'hardware/edit.html',
            locals: {
                items: clonedHardware
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.remove = function (hardware) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Hardware" }
            }
        }).then(function () {
            $scope.savedDevice = hardware.model;
            HardwareService.remove(hardware._id).then(function (promise) {
                if (promise.errmsg) displayError(promise);
                else {
                    $scope.refresh();
                }
            });
        });

    }

    $scope.refresh();
});

angular.module('Hardware').controller('HardwareDetailsCtrl', function ($scope, $routeParams, $mdDialog, DeviceService, HardwareService) {
    $scope.hardware;
    $scope.request;
    $scope.filters;
    $scope.refreshRequested = false;
    var hardwareId;

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
            controller: 'DeviceEditCtrl',
            templateUrl: 'device/edit.html',
            locals: {
                items: { model: $scope.hardware._id }
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    HardwareService.get($routeParams.model).then(function (promise) {
        if (promise.error) displayError(promise);
        else {
            $scope.hardware = promise;
            $scope.hardwareId = promise._id;
            $scope.filters = { hardwareId: $scope.hardwareId };
            $scope.refresh();
        }
    });

    $scope.refresh = function () {
        $scope.refreshRequested = true;
    }
});

angular.module('Hardware').controller('HardwareEditCtrl', function ($scope, $mdDialog, items, HardwareTypeService, HardwareService) {
    // items is injected in the controller, not its scope!    
    if (items && items._id) {
        $scope.action = "Edit";
        var master = items;
    } else if (items) {
        $scope.action = "Clone";
        var master = items;
    } else {
        $scope.action = "Add";
        var master = { type: "", model: "", serial: "" };
    }
    $scope.hardwareType = HardwareTypeService.getHardwareType();
    $scope.reset = function () {
        $scope.hardware = angular.copy(master);
    };

    $scope.reset();

    $scope.save = function (hardware) {
        $scope.savedHardware = hardware.model;
        HardwareService.create(hardware).then(function (promise) {
            if (promise.errmsg) console.log(promise)
            else {
                $mdDialog.hide();
            }
        })
    };
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };

});