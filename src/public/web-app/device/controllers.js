
angular.module('Device').controller('DeviceListCtrl', function ($scope, $routeParams, $mdDialog, HardwareTypeService, DeviceService) {
    $scope.devices = [];
    $scope.displayedDevices = [];
    $scope.selected = [];
    $scope.query = {
        order: "model",
        limit: 10,
        page: 1,
        pageSelect: 1,
        loaned: true,
        lost: false,
        filter: ""
    }
    $scope.request;
    var filters;
    if ($routeParams.hardwareId) filters = { hardwareId: $routeParams.hardwareId };


    function filter() {
        $scope.displayedDevices = [];
        $scope.devices.forEach(function (device) {
            if (($scope.query.loaned || !device.loanId)
                && ($scope.query.lost || !device.lost)
                && ($scope.query.filter == ""
                    || device.hardwareId.model.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                    || device.serialNumber.indexOf($scope.query.filter) >= 0
                    || device.macAddress.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0))
                $scope.displayedDevices.push(device);
        })
    }
    $scope.$watch("query.loaned", function () {
        filter();
    })
    $scope.$watch("query.lost", function () {
        filter();
    })
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

    $scope.refresh = function () {
        $scope.request = DeviceService.getList(filters)
        $scope.request.then(function (promise) {
            if (promise && promise.error) displayError(promise);
            else {
                $scope.displayedDevices = $scope.devices = promise;
                filter() 
            }
        });
    }

    $scope.editDevice = function (device) {
        $mdDialog.show({
            controller: 'DeviceEditCtrl',
            templateUrl: 'device/edit/view.html',
            locals: {
                items: device
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.copyDevice = function (device) {
        const clonedDevice = angular.copy(device);
        delete clonedDevice._id;
        $mdDialog.show({
            controller: 'DeviceEditCtrl',
            templateUrl: 'device/edit/view.html',
            locals: {
                items: clonedDevice
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.remove = function (device) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Device" }
            }
        }).then(function () {
            $scope.savedDevice = device.model;
            DeviceService.remove(device._id).then(function (promise) {
                if (promise && promise.error) displayError(promise);
                else $scope.refresh();
            });
        });
    }


    $scope.refresh();
});



angular.module('Device').controller('DeviceDetailsCtrl', function ($scope, $routeParams, $mdDialog, DeviceService, LoanService) {
    $scope.device;
    $scope.loans;
    $scope.query = {
        order: "startDate",
        limit: 10,
        page: 1,
        pageSelect: 1
    }
    $scope.request;
    var deviceId;

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
        $scope.request = LoanService.getList({ deviceId: deviceId })
        $scope.request.then(function (promise) {
            if (promise && promise.error) displayError(promise);
            else $scope.loans = promise;
        });
    }

    $scope.editLoan = function (loan) {
        var items;
        if (loan) items = loan;
        else items = {
            loanId: $scope.loan._id
        }
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit/view.html',
            locals: {
                items: items
            }
        }).then(function () {
            $scope.refresh();
        });
    }


    DeviceService.get($routeParams.serialNumber).then(function (promise) {
        if (promise.error) displayError(promise);
        else {
            $scope.device = promise;
            deviceId = promise._id;
            $scope.refresh();
        }
    });
});

angular.module('Device').controller('DeviceEditCtrl', function ($scope, $routeParams, $mdDialog, items, HardwareService, DeviceService, DevicesToReplace, UserService) {
    $scope.replacingDevices = [];
    if (items && items.model) {
        $scope.action = "Add";
        var master = {
            ownerId: "",
            hardwareId: items.model,
            serialNumber: "",
            macAddress: "",
            entryDate: new Date(),
            origin: "",
            order: "",
            replacingDeviceId: null,
            comment: ""
        }
    }
    else if (items && items._id) {
        $scope.action = "Edit";
        var master = {
            _id: items._id,
            ownerId: items.ownerId ? items.ownerId._id : "",
            hardwareId: items.hardwareId._id,
            serialNumber: items.serialNumber,
            macAddress: items.macAddress,
            entryDate: new Date(items.entryDate),
            origin: items.origin,
            order: items.order,
            replacingDeviceId: items.replacingDeviceId,
            comment: items.comment
        }
    } else if (items) {
        $scope.action = "Clone";
        var master = {
            ownerId: items.ownerId._id,
            hardwareId: items.hardwareId._id,
            serialNumber: items.serialNumber,
            macAddress: items.macAddress,
            entryDate: new Date(items.entryDate),
            origin: items.origin,
            order: items.order,
            replacingDeviceId: items.replacingDeviceId,
            comment: items.comment
        }
    } else {
        $scope.action = "Add";
        var master = {
            ownerId: "",
            hardwareId: "",
            serialNumber: "",
            macAddress: "",
            entryDate: new Date(),
            origin: "",
            order: "",
            replacingDeviceId: null,
            comment: ""
        }
    }

    $scope.$watch("device.hardwareId", function () {
        if ($scope.hardwares && master.serialNumber == "")
            $scope.hardwares.forEach(function (hardware) {
                if (hardware._id == $scope.device.hardwareId) $scope.device.serialNumber = hardware.serialFormat;
            })
    })
    $scope.workInProgress = true;

    HardwareService.getList().then(function (promise) {
        $scope.hardwares = promise;
        UserService.getList().then(function (promise) {
            $scope.users = promise.users;
            if (master.ownerId == "") master.ownerId = promise.currentUser;
            $scope.reset();
            $scope.workInProgress = false;
        });
    });


    $scope.reset = function () {
        $scope.device = angular.copy(master);
    };

    $scope.save = function (device) {
        $scope.savedDevice = device.serialNumber;
        DeviceService.create(device).then(function (promise) {
            if (promise.errors) $scope.error = true;
            else {
                $mdDialog.hide();
            }
        })
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };

    $scope.macAddressFormat = function () {
        if ($scope.device && $scope.device.macAddress) {
            $scope.device.macAddress = $scope.device.macAddress.replace(/:/g, "").replace(/(.{2})/g, "$1:").substr(0, 17).toUpperCase();
        };
    }

    $scope.loadReplacingDevice = function () {
        DeviceService.getList({ hardwareId: master.hardwareId }).then(function (promise) {
            if (promise && promise.error) console.log(promise.error)
            else $scope.replacingDevices = promise;
        })
    }
});
