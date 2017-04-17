angular.module('Hardware').controller('HardwareListCtrl', function ($scope, $routeParams, $mdDialog, HardwareTypeService, HardwareService, ErrorService) {
    $scope.hardwares = [];
    $scope.displayedHardwares = [];
    $scope.query = {
        order: "model",
        limit: 10,
        page: 1,
        ap: true,
        sr: true,
        br: true,
        phyAppliance: true,
        other: true,
        filter: ""
    }

    $scope.request;

    function filter() {
        $scope.displayedHardwares = [];
        $scope.hardwares.forEach(function (hardware) {
            if ((
                ($scope.query.ap && hardware.type == "Access Point")
                || ($scope.query.sr && hardware.type == "Switch")
                || ($scope.query.sr && hardware.type == "Branch Router")
                || ($scope.query.sr && hardware.type == "Physical Appliance")
                || ($scope.query.br && hardware.type == "Other")
            ) && ($scope.query.filter == ""
                || hardware.model.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                ))
                $scope.displayedHardwares.push(hardware);

        })
    }
    $scope.$watch("query.ap", function () {
        filter();
    })
    $scope.$watch("query.sr", function () {
        filter();
    })
    $scope.$watch("query.br", function () {
        filter();
    })
    $scope.$watch("query.phyAppliance", function () {
        filter();
    })
    $scope.$watch("query.other", function () {
        filter();
    })
    $scope.$watch("query.filter", function () {
        filter();
    })

    $scope.refresh = function () {
        $scope.request = HardwareService.getList();
        $scope.request.then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                $scope.hardwares = promise;
                filter();
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
                if (promise && promise.error) ErrorService.display(promise.error);
                else $scope.refresh();

            });
        });

    }

    $scope.refresh();
});

angular.module('Hardware').controller('HardwareDetailsCtrl', function ($scope, $routeParams, $mdDialog, DeviceService, HardwareService, ErrorService) {
    $scope.query = {
        loaned: true,
        lost: false,
        available: true
    }
    $scope.hardware;
    $scope.request;
    $scope.filters;
    $scope.refreshRequested = false;
    var hardwareId;

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
        if (promise && promise.error) ErrorService.display(promise.error);
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

angular.module('Hardware').controller('HardwareEditCtrl', function ($scope, $mdDialog, items, HardwareTypeService, HardwareService, ErrorService) {
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
            $mdDialog.hide();
            if (promise && promise.error) ErrorService.display(promise.error);
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