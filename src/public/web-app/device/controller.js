
angular
    .module('Device')
    .controller('DeviceListCtrl', deviceListCtrl)
    .controller('DeviceDetailsCtrl', deviceDetailsCtrl)
    .controller('DeviceEditCtrl', deviceEditCtrl)

function deviceListCtrl(DeviceService) {
    var deviceList = this;
    // variables
    deviceList.refreshRequested = true;
    deviceList.query = {
        loaned: false,
        lost: false,
        available: true
    }

    // functions bindings
    deviceList.refresh = refresh;
    deviceList.edit = edit;

    // functions
    function refresh() {
        $scope.refreshRequested = true;
    }
    function edit() {
        DeviceService.edit().then(function () {
            deviceList.refreshRequested = true;
        })
    }
}

function deviceDetailsCtrl($routeParams, DeviceService) {
    var deviceDetails = this;
    // variables
    deviceDetails.device;
    deviceDetails.filters;
    deviceDetails.service = DeviceService;
    deviceDetails.query = {
        aborted: true,
        returned: true,
        progress: true,
        overdue: true
    }
    var deviceId;
    // functions bindings
    deviceDetails.edit = edit;
    deviceDetails.refreshLoans = refreshLoans;
    deviceDetails.refreshRequested = false;
    // functions
    function edit() {
        DeviceService.edit(deviceDetails.device).then(function () {
            refresh();
        });
    }
    function refresh() {
        DeviceService.get($routeParams.serialNumber).then(function (promise) {
            deviceDetails.device = promise;
            deviceId = promise._id;
            deviceDetails.filters = { deviceId: deviceId };
            refreshLoans();
        });
    }
    function refreshLoans() {
        deviceDetails.refreshRequested = true;
    }
    // init
    refresh();
}
function deviceEditCtrl($scope, $mdDialog, items, HardwareService, DeviceService, DevicesToReplace, UserService) {
    var deviceEdit = this;
    // variables
    deviceEdit.replacingDevices = [];
    if (items && items.model) {
        deviceEdit.action = "Add";
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
        deviceEdit.action = "Edit";
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
            comment: items.comment,
            lost: items.lost
        }
    } else if (items) {
        deviceEdit.action = "Clone";
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
        deviceEdit.action = "Add";
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
    // functions binding
    deviceEdit.reset = reset;
    deviceEdit.save = save;
    deviceEdit.cancel = cancel;
    deviceEdit.close = close;
    deviceEdit.macAddressFormat = macAddressFormat;
    deviceEdit.loadReplacingDevice = loadReplacingDevice;
    // watchers
    $scope.$watch("deviceEdit.device.hardwareId", function () {
        if (deviceEdit.hardwares && master.serialNumber == "")
            deviceEdit.hardwares.forEach(function (hardware) {
                if (hardware._id == deviceEdit.device.hardwareId) deviceEdit.device.serialNumber = hardware.serialFormat;
            })
    })
    // functions
    function reset() {
        deviceEdit.device = angular.copy(master);
    };
    function save() {
        DeviceService.create(deviceEdit.device).then(function (promise) {
            $mdDialog.hide();
        })
    };
    function macAddressFormat() {
        if (deviceEdit.device && deviceEdit.device.macAddress) {
            deviceEdit.device.macAddress = deviceEdit.device.macAddress.replace(/:/g, "").replace(/(.{2})/g, "$1:").substr(0, 17).toUpperCase();
        };
    }
    function loadReplacingDevice() {
        DeviceService.getList({ hardwareId: master.hardwareId }).then(function (promise) {
            deviceEdit.replacingDevices = promise;
        })
    }

    function load() {
        HardwareService.getList().then(function (promise) {
            deviceEdit.hardwares = promise;
            UserService.getList().then(function (promise) {
                deviceEdit.users = promise.users;
                if (master.ownerId == "") master.ownerId = promise.currentUser;
                reset();
            });

        });
    }

    function cancel() {
        $mdDialog.cancel()
    };
    function close() {
        $mdDialog.hide();
    };


    // init
    load()

}