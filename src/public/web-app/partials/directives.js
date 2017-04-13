angular.module('Partials').directive('detailedHeader', function () {
    return {
        restrict: 'E',
        scope: {
            'title': '@',
            'object': "=",
            'edit': '&',
        },
        templateUrl: "/web-app/partials/detailedHeader.html"
    };
});

angular.module('Partials').directive('listLoans', function ($mdDialog, LoanService) {
    return {
        restrict: 'E',
        scope: {
            'filters': "=",
            'refresh': '='
        },
        templateUrl: "/web-app/partials/listLoans.html",
        link: function postLink($scope) {

            $scope.loans = [];
            $scope.displayedLoans = [];
            $scope.query = {
                order: "startDate",
                limit: 10,
                page: 1,
                aborted: false,
                returned: true,
                pageSelect: 1,
                filter: ""
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

            function refresh() {
                $scope.request = LoanService.getList($scope.filters);
                $scope.request.then(function (promise) {
                    if (promise && promise.error) displayError(promise);
                    else {
                        $scope.loans = promise;
                        filter();
                    }
                    $scope.refresh = false;
                });
            }
            function filter() {
                $scope.displayedLoans = [];
                $scope.loans.forEach(function (loan) {
                    console.log(new Date(loan.endDate).getTime());
                    if (
                        ($scope.query.returned || !loan.endDate || new Date(loan.endDate).getTime() == 0)
                        && ($scope.query.aborted || !loan.aborted)
                        && ($scope.query.filter == ""
                            || loan.companyId.name.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                            || loan.contactId.name.toLowerCase().indexOf($scope.query.filter) >= 0
                            || loan.contactId.email.toLowerCase().indexOf($scope.query.filter) >= 0
                            || loan.ownerId.name.first.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                            || loan.ownerId.name.last.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0))
                        $scope.displayedLoans.push(loan);
                })
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
                    refresh();
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
                    refresh();
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
                        else refresh();
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
                            refresh();
                        }
                    });
                });
            }

            $scope.checkStatus = function (loan) {
                if (loan.aborted) return "aborted";
                else if (loan.endDate && new Date(loan.endDate).getTime() > 0) return "ended";
                else if (new Date(loan.estimatedEndDate) > new Date()) return "progress";
                else return "overdue";
            }
            $scope.$watch("query.returned", function () {
                filter();
            })
            $scope.$watch("query.aborted", function () {
                filter();
            })
            $scope.$watch("query.filter", function () {
                filter();
            })
            $scope.$watch('refresh', function () {
                if ($scope.refresh) refresh();
            })
        }
    };
});


angular.module('Partials').directive('listDevices', function ($mdDialog, DeviceService) {
    return {
        restrict: 'E',
        scope: {
            'filters': "=",
            'refresh': "="
        },
        templateUrl: "/web-app/partials/listDevices.html",
        link: function postLink($scope) {
            $scope.devices = [];
            $scope.displayedDevices = [];
            $scope.query = {
                order: "serialNumber",
                limit: 10,
                page: 1,
                pageSelect: 1,
                loaned: true,
                lost: false,
                filter: ""
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

            function refresh() {
                $scope.request = DeviceService.getList($scope.filters)
                $scope.request.then(function (promise) {
                    if (promise && promise.error) displayError(promise);
                    else {
                        $scope.displayedDevices = $scope.devices = promise;
                        filter();
                    }
                    $scope.refresh = false;
                });
            }

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

            $scope.editDevice = function (device) {
                $mdDialog.show({
                    controller: 'DeviceEditCtrl',
                    templateUrl: 'device/edit/view.html',
                    locals: {
                        items: device
                    }
                }).then(function () {
                    refresh();
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
                    refresh();
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
                        else refresh();
                    });
                });
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

            $scope.$watch('refresh', function () {
                if ($scope.refresh) refresh();
            })
        }
    };
});