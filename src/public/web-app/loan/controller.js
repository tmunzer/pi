angular
    .module('Loan')
    .controller('LoanListCtrl', loanListCtrl)
    .controller('LoanDetailsCtrl', loanDetailsCtrl)
    .controller('LoanEditCtrl', loanEditCtrl)

function loanListCtrl(LoanService) {
    var loanList = this;
    // variables
    loanList.refreshRequested = true;
    loanList.query = {
        aborted: false,
        returned: false,
        progress: true,
        overdue: true
    }
    // functions bindings
    loanList.edit = edit;
    loanList.refresh = refresh;
    // functions
    function edit(loan) {
        LoanService.edit(loan).then(function () {
            refresh()
        });
    }
    function refresh() {
        loanList.refreshRequested = true;
    }
};

function loanDetailsCtrl($routeParams, LoanService) {
    var loanDetails = this;
    // variables
    loanDetails.query = {
        loaned: true,
        lost: true,
        available: true
    }
    loanDetails.loan;
    loanDetails.service = LoanService;
    loanDetails.status;
    loanDetails.refreshRequested = false;
    loanDetails.filters = { id: [] };
    let hardwares;
    // functions bindings
    loanDetails.abort = abort
    loanDetails.revert = revert
    loanDetails.edit = edit
    loanDetails.returned = returned;
    // functions
    function checkStatus() {
        if (loanDetails.loan.aborted) return "aborted";
        else if (loanDetails.loan.endDate) return "returned";
        else if (new Date(loanDetails.loan.estimatedEndDate) > new Date()) return "progress";
        else return "overdue";
    }
    function abort() {
        LoanService.abort(loanDetails.loan, function () { refresh() });
    }
    function revert() {
        LoanService.revert(loanDetails.loan, function () { refresh() });
    }
    function returned() {
        LoanService.returned(loanDetails.loan, function () { refresh() });
    }
    function edit() {
        LoanService.edit(loanDetails.loan).then(function () { refresh(); });
    }
    function refresh() {
        LoanService.get($routeParams.loanId).then(function (promise) {
            loanDetails.loan = promise;
            loanDetails.status = checkStatus();
            loanDetails.filters = { id: [] };
            loanDetails.loan.deviceId.forEach(function (device) {
                loanDetails.filters.id.push(device._id);
            })
            loanDetails.refreshRequested = true;
        });
    }
    // init
    refresh();
};


function loanEditCtrl($scope, $mdDialog, items, LoanService, UserService, HardwareService, DeviceService, CompanyService, ContactService) {
    var loanEdit = this;
    // variables
    // if cloned or edited loan
    if (items) {
        var master = {
            deviceId: [],
            companyId: items.companyId,
            contactId: items.contactId,
            ownerId: items.ownerId._id,
            startDate: new Date(items.startDate),
            estimatedEndDate: new Date(items.estimatedEndDate)
        };
        var master_companyId = items.companyId;
        var master_contactId = items.contactId;
        // if edited
        if (items._id) {
            master.aborted = items.aborted;
            master._id = items._id;
            master.poe = items.poe;
            master.other = items.other;
            if (items.endDate) master.endDate = new Date(items.endDate);
            var master_selectedDevices = [];
            items.deviceId.forEach(function (dev) {
                master_selectedDevices.push({ hardwareId: dev.hardwareId, deviceId: dev._id, choices: [{ _id: dev._id, serialNumber: dev.serialNumber }] })
            })
            loanEdit.action = "Edit";
        }
        //if cloned
        else {
            master.poe = 0;
            master.other = "";
            var master_selectedDevices = [{ hardwareId: undefined, deviceId: undefined, choices: [] }];
            loanEdit.action = "Clone";
        }
        //if new
    } else {
        var master = {
            deviceId: [],
            companyId: null,
            contactId: null,
            ownerId: "",
            poe: 0,
            other: "",
            startDate: new Date(),
            estimatedEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1))

        };
        var master_selectedDevices = [{ hardwareId: undefined, deviceId: undefined, choices: [] }];
        var master_companyId = null;
        var master_contactId = null;
        loanEdit.action = "Add";
    }
    loanEdit.users;
    loanEdit.hardwares;
    loanEdit.devices;
    loanEdit.companyId;
    loanEdit.contactId;
    loanEdit.contactInfoSaved = false;
    loanEdit.contactInfoChanged = false;
    // functions bindings
    loanEdit.reset = reset;
    loanEdit.updateContact = updateContact;
    loanEdit.loadDevices = loadDevices;
    loanEdit.removeDevice = removeDevice;
    loanEdit.save = save;
    loanEdit.cancel = cancel;
    loanEdit.close = close;
    // watchers
    $scope.$watch("loanEdit.companyId", function () {
        if (loanEdit.companyId)
            loanEdit.loan.companyId = loanEdit.companyId._id;
        loanEdit.contact.refresh();
    });
    $scope.$watch("loanEdit.contactId", function () {
        if (loanEdit.contactId) {
            loanEdit.loan.contactId = loanEdit.contactId._id;
            master_contactId = angular.copy(loanEdit.contactId);
            loanEdit.contactInfoSaved = false;
            loanEdit.contactInfoChanged = false;
        }
    })
    $scope.$watch("loanEdit.contactId.email", function () {
        if (master_contactId && loanEdit.contactId)
            loanEdit.contactInfoChanged = (master_contactId.phone != loanEdit.contactId.phone || master_contactId.email != loanEdit.contactId.email)
    })
    $scope.$watch("loanEdit.contactId.phone", function () {
        if (master_contactId && loanEdit.contactId)
            loanEdit.contactInfoChanged = (master_contactId.phone != loanEdit.contactId.phone || master_contactId.email != loanEdit.contactId.email)
    })
    $scope.$watch("loanEdit.selectedDevices", function () {
        if (loanEdit.selectedDevices) {
            var newLine = false;
            loanEdit.selectedDevices.forEach(function (device) {
                if (!device.deviceId) newLine = true;
            })
            if (!newLine) loanEdit.selectedDevices.push({ hardwareId: undefined, deviceId: undefined, choices: [] });
        }
    }, true)
    // functions
    function reset() {
        loanEdit.loan = angular.copy(master);
        loanEdit.selectedDevices = master_selectedDevices;
        loanEdit.companyId = master_companyId;
        loanEdit.contactId = master_contactId;
    };
    function updateContact() {
        ContactService.create(loanEdit.contactId).then(function (promise) {
            loanEdit.contactInfoSaved = true;
            loanEdit.contactInfoChanged = false;
        })
    }
    function loadDevices(device) {
        device.choices = [];
        if (loanEdit.model != 0)
            DeviceService.getList({ hardwareId: device.hardwareId }).then(function (promise) {
                var tempList = promise;
                // remove the already selected and devices from the list
                loanEdit.selectedDevices.forEach(function (selectedDevices) {
                    var index = -1;
                    for (var i = 0; i < tempList.length; i++) {
                        if (tempList[i].lost || selectedDevices.deviceId == tempList[i]._id) index = i;
                    }
                    if (index >= 0) tempList.splice(index, 1);
                })
                tempList.forEach(function (item) {
                    if (!item.loanId) device.choices.push(item);
                })
            })
    };
    function removeDevice(index) {
        loanEdit.selectedDevices.splice(index, 1);
    }
    function save() {
        loanEdit.selectedDevices.forEach(function (device) {
            if (device.deviceId) loanEdit.loan.deviceId.push(device.deviceId);
        })
        LoanService.create(loanEdit.loan).then(function (promise) {
            if (promise) close()
        })
    };
    function cancel() {
        $mdDialog.cancel()
    };
    function close() {
        $mdDialog.hide();
    };
    function init() {
        UserService.getList().then(function (promise) {
            loanEdit.users = promise.users;
            if (master.ownerId == "") master.ownerId = promise.currentUser;
            HardwareService.getList().then(function (promise) {
                loanEdit.hardwares = promise;
                loanEdit.reset();
            })
        })
    }
    // autocomplete
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(item) {
            return (item.name.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
    }

    loanEdit.company = {
        companies: [],
        searchText: null,
        refresh: function refresh() {
            CompanyService.getList().then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else {
                    loanEdit.company.companies = promise;
                }
            })
        },
        querySearch: function querySearch(query) {
            return query ? loanEdit.company.companies.filter(createFilterFor(query)) : loanEdit.company.companies;
        },
        newCompany: function newCompany(company) {
            var company_name = company.trim();
            var already_exists = false;
            loanEdit.company.companies.forEach(function (comp_list) {
                if (company_name.toLowerCase() === comp_list.name.toLowerCase) already_exists = true;
            })
            if (!already_exists)
                CompanyService.create({ name: company.trim() }).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else {
                        loanEdit.company.selectedItem = promise;
                        loanEdit.company.refresh();
                    }
                })
        },
    }

    loanEdit.contact = {
        contacts: [],
        searchText: null,
        refresh: function refresh() {
            if (loanEdit.loan)
                ContactService.getList({ companyId: loanEdit.loan.companyId }).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else loanEdit.contact.contacts = promise;

                })
        },
        querySearch: function querySearch(query) {
            return query ? loanEdit.contact.contacts.filter(createFilterFor(query)) : loanEdit.contact.contacts;
        },
        newContact: function newContact(contact) {
            var contact_name = contact.trim();
            var already_exists = false;
            loanEdit.contact.contacts.forEach(function (cont_list) {
                if (contact_name.toLowerCase() === cont_list.name.toLowerCase) already_exists = true;
            })
            if (!already_exists)
                ContactService.create({ companyId: loanEdit.loan.companyId, name: contact.trim() }).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else {
                        loanEdit.contact.selectedItem = promise;
                        loanEdit.contact.refresh();
                    }
                })
        }
    }

    // init
    loanEdit.company.refresh();
    init();
};

