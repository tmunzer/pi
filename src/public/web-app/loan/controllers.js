angular.module('Loan').controller('LoanListCtrl', function ($scope, $routeParams, $mdDialog, LoanService) {
    $scope.loans = [];
    $scope.query = {
        order: "startDate",
        limit: 10,
        page: 1,
        pageSelect: 1
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
        $scope.request = LoanService.getList();
        $scope.request.then(function (promise) {
            if (promise.error) displayError(promise);
            else {
                $scope.loans = promise;
            }
        });
    }

    $scope.editLoan = function (loan) {
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit/view.html',
            locals: {
                items: loan
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.copyLoan = function (loan) {
        const clonedLoan = angular.copy(loan);
        delete clonedLoan._id;
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit/view.html',
            locals: {
                items: clonedLoan
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.returnLoan = function (loan) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirmReturn.html',
            locals: {
                items: { item: loan.companyId.name }
            }
        }).then(function () {
            loan.endDate = new Date();
            LoanService.create(loan).then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else $scope.refresh();
            })

        });
    }

    $scope.remove = function (loan) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Loan" }
            }
        }).then(function () {
            LoanService.remove(loan._id).then(function (promise) {
                if (promise.errmsg) displayError(promise);
                else {
                    $scope.refresh();
                }
            });
        });


    }

    $scope.refresh();
});

angular.module('Loan').controller('LoanDetailsCtrl', function ($scope, $routeParams, $mdDialog, LoanService, HardwareService) {
    $scope.loan;
    $scope.query = {
        order: "serialNumber",
        limit: 10,
        page: 1,
        pageSelect: 1
    }
    let hardwares;

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
        HardwareService.getList().then(function (promise) {
            if (promise && promise.error) console.log(err);
            else {
                hardwares = promise;
                LoanService.get($routeParams.loanId).then(function (promise) {
                    if (promise.error) displayError(promise);
                    else {
                        $scope.loan = promise;
                        $scope.loan.deviceId.forEach(function (device) {
                            hardwares.forEach(function (hardware) {
                                if (hardware._id == device.hardwareId) device.hardware = hardware.model;
                            })
                        })
                    }
                })
            }
        });
    }



    $scope.editLoan = function () {
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit/view.html',
            locals: {
                items: $scope.loan
            }
        }).then(function () {
            $scope.refresh();
        });
    }
    $scope.copyLoan = function (loan) {
        const clonedLoan = angular.copy(loan);
        delete clonedLoan._id;
        $mdDialog.show({
            controller: 'LoanEditCtrl',
            templateUrl: 'loan/edit/view.html',
            locals: {
                items: clonedLoan
            }
        }).then(function () {
            $scope.refresh();
        });
    }

    $scope.refresh();

});


angular.module('Loan').controller('LoanEditCtrl', function ($scope, $mdDialog, items, LoanService, UserService, HardwareService, DeviceService, CompanyService, ContactService) {
    // if cloned or edited loan
    if (items) {
        var master = {
            deviceId: [],
            companyId: items.companyId,
            contactId: items.contactId,
            ownerId: items.ownerId._id,
            startDate: new Date(items.startDate),
            estimatedEndDate: new Date(items.estimatedEndDate),
            endDate: new Date(items.endDate)
        };
        var master_companyId = items.companyId;
        var master_contactId = items.contactId;
        // if edited
        if (items._id) {
            master._id = items._id;
            master.poe = items.poe;
            master.other = items.other;
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
            estimatedEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            endDate: ""
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
            if (promise && promise.error) console.log(promise.error)
            else {
                $scope.contactInfoSaved = true;
                $scope.contactInfoChanged = false;
            }
        })
    }


    UserService.getList().then(function (promise) {
        if (promise && promise.error) console.log(promise.error);
        else {
            $scope.users = promise.users;
            if (master.ownerId == "") master.ownerId = promise.currentUser;
            HardwareService.getList().then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
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
                if (promise && promise.error) console.log(promise.error);
                else {
                    var tempList = promise;
                    // remove the already selected devices from the list
                    $scope.selectedDevices.forEach(function (selectedDevices) {
                        var index = -1;
                        for (var i = 0; i < tempList.length; i++) {
                            if (selectedDevices.deviceId == tempList[i]._id) index = i;
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
            if (promise.errmsg) console.log(promise)
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
                if (promise && promise.error) console.log(promise.error);
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
                CompanyService.create(company.trim()).then(function (promise) {
                    if (promise && promise.error) console.log(promise.error)
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
                    if (promise && promise.error) console.log(promise.error);
                    else {
                        $scope.contact.contacts = promise;
                    }
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
                    if (promise && promise.error) console.log(promise.error)
                    else {
                        $scope.contact.selectedItem = promise;
                        $scope.contact.refresh();
                    }
                })
        }
    }


});

