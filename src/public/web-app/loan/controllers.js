angular.module('Loan').controller('LoanListCtrl', function ($scope, $routeParams, $mdDialog, LoanService) {
    $scope.query = {
        aborted: false,
        returned: false,
        progress: true,
        overdue: true
    }

    $scope.editLoan = function (loan) {
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit.html',
            locals: {
                items: null
            }
        }).then(function () {
            $scope.refreshRequested = true;
        });
    }

    $scope.refreshRequested = true;
    $scope.refresh = function () {
        $scope.refreshRequested = true;
    }
});

angular.module('Loan').controller('LoanDetailsCtrl', function ($scope, $routeParams, $mdDialog, LoanService, HardwareService, ErrorService) {
    $scope.query = {
        loaned: true,
        lost: true,
        available: true
    }

    $scope.loan;
    $scope.service = LoanService;
    $scope.status;
    $scope.refreshRequested = false;
    $scope.filters = { id: [] };
    let hardwares;


    function checkStatus() {
        if ($scope.loan.aborted) return "aborted";
        else if ($scope.loan.endDate) return "returned";
        else if (new Date($scope.loan.estimatedEndDate) > new Date()) return "progress";
        else return "overdue";
    }

    function Load() {
        LoanService.get($routeParams.loanId).then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                $scope.loan = promise;
                $scope.status = checkStatus();
                $scope.loan.deviceId.forEach(function (device) {
                    $scope.filters.id.push(device._id);
                })
                $scope.refreshRequested = true;
            }
        });
    }
    $scope.abortLoan = function () {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmAbort.html',
            locals: {
                items: { item: $scope.loan.companyId.name }
            }
        }).then(function () {
            $scope.loan.aborted = true;
            LoanService.create($scope.loan).then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else Load();
            })

        });
    }
    $scope.revert = function () {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmRevert.html',
            locals: {
                items: { item: $scope.loan.companyId.name }
            }
        }).then(function () {
            $scope.loan.aborted = false;
            $scope.loan.endDate = null;
            LoanService.create($scope.loan).then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else Load();
            })

        });
    }
    $scope.editLoan = function () {
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit.html',
            locals: {
                items: $scope.loan
            }
        }).then(function () {
            Load();
        });
    }
    $scope.returnLoan = function () {
        $mdDialog.show({
            controller: 'ConfirmReturnCtrl',
            templateUrl: 'modals/confirmReturn.html',
            locals: {
                items: angular.copy($scope.loan)
            }
        }).then(function (loan) {
            LoanService.create(loan).then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else Load();
            })

        });
    }

    Load();
});


angular.module('Loan').controller('LoanEditCtrl', function ($scope, $mdDialog, items, LoanService, UserService, HardwareService, DeviceService, CompanyService, ContactService, ErrorService) {
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
            master._id = items._id;
            master.poe = items.poe;
            master.other = items.other;
            if (items.endDate) master.endDate = new Date(items.endDate);
            var master_selectedDevices = [];
            items.deviceId.forEach(function (dev) {
                master_selectedDevices.push({ hardwareId: dev.hardwareId, deviceId: dev._id, choices: [{ _id: dev._id, serialNumber: dev.serialNumber }] })
            })
            $scope.action = "Edit";
        }
        //if cloned
        else {
            master.poe = 0;
            master.other = "";
            var master_selectedDevices = [{ hardwareId: undefined, deviceId: undefined, choices: [] }];
            $scope.action = "Clone";
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
        $scope.action = "Add";
    }

    $scope.reset = function () {
        $scope.loan = angular.copy(master);
        $scope.selectedDevices = master_selectedDevices;
        $scope.companyId = master_companyId;
        $scope.contactId = master_contactId;
    };

    $scope.users;
    $scope.hardwares;
    $scope.devices;
    $scope.companyId;
    $scope.$watch("companyId", function () {
        if ($scope.companyId)
            $scope.loan.companyId = $scope.companyId._id;
        $scope.contact.refresh();
    });
    $scope.contactId;
    $scope.contactInfoSaved = false;
    $scope.contactInfoChanged = false;



    $scope.$watch("contactId", function () {
        if ($scope.contactId) {
            $scope.loan.contactId = $scope.contactId._id;
            master_contactId = angular.copy($scope.contactId);
            $scope.contactInfoSaved = false;
            $scope.contactInfoChanged = false;
        }
    })
    $scope.$watch("contactId.email", function () {
        if (master_contactId && $scope.contactId)
            $scope.contactInfoChanged = (master_contactId.phone != $scope.contactId.phone || master_contactId.email != $scope.contactId.email)
    })
    $scope.$watch("contactId.phone", function () {
        if (master_contactId && $scope.contactId)
            $scope.contactInfoChanged = (master_contactId.phone != $scope.contactId.phone || master_contactId.email != $scope.contactId.email)
    })
    $scope.updateContact = function () {
        ContactService.create($scope.contactId).then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                $scope.contactInfoSaved = true;
                $scope.contactInfoChanged = false;
            }
        })
    }


    UserService.getList().then(function (promise) {
        if (promise && promise.error) ErrorService.display(promise.error);
        else {
            $scope.users = promise.users;
            if (master.ownerId == "") master.ownerId = promise.currentUser;
            HardwareService.getList().then(function (promise) {
                if (promise && promise.error) ErrorService.display(propromise.errormise);
                else {
                    $scope.hardwares = promise;
                    $scope.reset();
                }
            })
        }
    })

    $scope.loadDevices = function (device) {
        device.choices = [];
        if ($scope.model != 0)
            DeviceService.getList({ hardwareId: device.hardwareId }).then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else {
                    var tempList = promise;
                    // remove the already selected and devices from the list
                    $scope.selectedDevices.forEach(function (selectedDevices) {
                        var index = -1;
                        for (var i = 0; i < tempList.length; i++) {
                            if (tempList[i].lost || selectedDevices.deviceId == tempList[i]._id) index = i;
                        }
                        if (index >= 0) tempList.splice(index, 1);
                    })
                    tempList.forEach(function (item) {
                        if (!item.loanId) device.choices.push(item);
                    })
                }
            })
    };

    $scope.$watch("selectedDevices", function () {
        if ($scope.selectedDevices) {
            var newLine = false;
            $scope.selectedDevices.forEach(function (device) {
                if (!device.deviceId) newLine = true;
            })
            if (!newLine) $scope.selectedDevices.push({ hardwareId: undefined, deviceId: undefined, choices: [] });
        }
    }, true)

    $scope.removeDevice = function (index) {
        $scope.selectedDevices.splice(index, 1);
    }

    $scope.save = function () {
        $scope.selectedDevices.forEach(function (device) {
            if (device.deviceId) $scope.loan.deviceId.push(device.deviceId);
        })
        LoanService.create($scope.loan).then(function (promise) {
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





    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(item) {
            return (item.name.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
    }



    $scope.company = {
        companies: [],
        searchText: null,
        refresh: function refresh() {
            CompanyService.getList().then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else {
                    $scope.company.companies = promise;
                }
            })
        },
        querySearch: function querySearch(query) {
            return query ? $scope.company.companies.filter(createFilterFor(query)) : $scope.company.companies;
        },
        newCompany: function newCompany(company) {
            var company_name = company.trim();
            var already_exists = false;
            $scope.company.companies.forEach(function (comp_list) {
                if (company_name.toLowerCase() === comp_list.name.toLowerCase) already_exists = true;
            })
            if (!already_exists)
                CompanyService.create({ name: company.trim() }).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else {
                        $scope.company.selectedItem = promise;
                        $scope.company.refresh();
                    }
                })
        },
    }
    $scope.company.refresh();




    $scope.contact = {
        contacts: [],
        searchText: null,
        refresh: function refresh() {
            if ($scope.loan)
                ContactService.getList({ companyId: $scope.loan.companyId }).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else $scope.contact.contacts = promise;
                    
                })
        },
        querySearch: function querySearch(query) {
            return query ? $scope.contact.contacts.filter(createFilterFor(query)) : $scope.contact.contacts;
        },
        newContact: function newContact(contact) {
            var contact_name = contact.trim();
            var already_exists = false;
            $scope.contact.contacts.forEach(function (cont_list) {
                if (contact_name.toLowerCase() === cont_list.name.toLowerCase) already_exists = true;
            })
            if (!already_exists)
                ContactService.create({ companyId: $scope.loan.companyId, name: contact.trim() }).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else {
                        $scope.contact.selectedItem = promise;
                        $scope.contact.refresh();
                    }
                })
        }
    }


});

