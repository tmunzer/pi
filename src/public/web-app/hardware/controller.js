angular
    .module('Hardware')
    .controller('HardwareListCtrl', hardwareListCtrl)
    .controller('HardwareDetailsCtrl', hardwareDetailsCtrl)
    .controller('HardwareEditCtrl', hardwareEditCtrl)

function hardwareListCtrl($scope, HardwareTypeService, HardwareService) {
    var hardwareList = this;
    // variables
    hardwareList.hardwares = [];
    hardwareList.displayedHardwares = [];
    hardwareList.query = {
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
    hardwareList.request;
    // functions binding
    hardwareList.refresh = refresh;
    hardwareList.edit = edit;
    hardwareList.copy = copy;
    hardwareList.remove = remove;
    // watchers
    $scope.$watch("hardwareList.query.ap", function () {
        filter();
    })
    $scope.$watch("hardwareList.query.sr", function () {
        filter();
    })
    $scope.$watch("hardwareList.query.br", function () {
        filter();
    })
    $scope.$watch("hardwareList.query.phyAppliance", function () {
        filter();
    })
    $scope.$watch("hardwareList.query.other", function () {
        filter();
    })
    $scope.$watch("hardwareList.query.filter", function () {
        filter();
    })
    // functions
    function filter() {
        hardwareList.displayedHardwares = [];
        hardwareList.hardwares.forEach(function (hardware) {
            if ((
                (hardwareList.query.ap && hardware.type == "Access Point")
                || (hardwareList.query.sr && hardware.type == "Switch")
                || (hardwareList.query.sr && hardware.type == "Branch Router")
                || (hardwareList.query.sr && hardware.type == "Physical Appliance")
                || (hardwareList.query.br && hardware.type == "Other")
            ) && (hardwareList.query.filter == ""
                || hardware.model.toLowerCase().indexOf(hardwareList.query.filter.toLowerCase()) >= 0
                ))
                hardwareList.displayedHardwares.push(hardware);

        })
    }
    function refresh() {
        hardwareList.request = HardwareService.getList();
        hardwareList.request.then(function (promise) {
            hardwareList.hardwares = promise;
            filter();
        });
    }
    function edit(hardware) {
        HardwareService.edit(hardware).then(function () {
            refresh();
        });
    }
    function copy(hardware) {
        const clonedHardware = angular.copy(hardware);
        delete clonedHardware._id;
        HardwareService.edit(clonedHardware).then(function () {
            refresh();
        });
    }
    function remove(hardware) {
        HardwareService.remove(hardware._id).then(function (promise) {
            refresh();
        });
    }
    // init
    refresh();
}

function hardwareDetailsCtrl($routeParams, DeviceService, HardwareService) {
    var hardwareDetails = this;
    // variables
    hardwareDetails.query = {
        loaned: true,
        lost: false,
        available: true
    }
    hardwareDetails.hardware;
    hardwareDetails.request;
    hardwareDetails.filters;
    hardwareDetails.refreshRequested = false;
    var hardwareId;
    // functions bindings
    hardwareDetails.edit = edit;
    hardwareDetails.refreshDevices = refreshDevices;
    // functions
    function edit() {
        DeviceService.edit({ model: hardwareDetails.hardware._id }).then(function () {
            refresh();
        });
    }
    function refresh() {
        HardwareService.get($routeParams.model).then(function (promise) {
            hardwareDetails.hardware = promise;
            hardwareDetails.hardwareId = promise._id;
            hardwareDetails.filters = { hardwareId: hardwareDetails.hardwareId };
            refreshDevices();
        });
    }
    function refreshDevices() {
        hardwareDetails.refreshRequested = true;
    }
    // init
    refresh()
}

function hardwareEditCtrl($mdDialog, items, HardwareTypeService, HardwareService) {
    // items is injected in the controller, not its scope!  
    var  hardwareEdit = this;
    console.log(items)
    // variables
    if (items && items._id) {
        hardwareEdit.action = "Edit";
        var master = items;
    } else if (items) {
        hardwareEdit.action = "Clone";
        var master = items;
    } else {
        hardwareEdit.action = "Add";
        var master = { type: "", model: "", serial: "" };
    }
    hardwareEdit.hardwareType = HardwareTypeService.getHardwareType();
    // functions bindings
    hardwareEdit.reset = reset;
    hardwareEdit.save =  save;
    hardwareEdit.cancel = cancel;
    hardwareEdit.close = close;
    //functions
    function reset () {
        hardwareEdit.hardware = angular.copy(master);
    };
    function save() {
        HardwareService.create(hardwareEdit.hardware).then(function (promise) {
            close();
        })
    };
    function cancel() {
        $mdDialog.cancel()
    };
    function close() {
        $mdDialog.hide();
    };
    // init
    reset();
}