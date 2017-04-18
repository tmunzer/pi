
angular
    .module('Partials')
    .directive('detailedHeader', detailedHeader)
    .directive('listLoans', listLoans)
    .directive('listDevices', listDevices)
    .directive('listContacts', listContacts)
    .directive('listComments', listComments)

function detailedHeader() {
    return {
        restrict: 'E',
        scope: {
            'title': '@',
            'object': "=",
            'edit': '&',
        },
        templateUrl: "/web-app/partials/detailedHeader.html"
    };
};
function listLoans(LoanService) {
    return {
        restrict: 'E',
        scope: {
            'filters': "=",
            'refresh': '=',
            'loans': "=?",
            'source': "@?",
            'aborted': "=?",
            'returned': "=?",
            'progress': "=?",
            'overdue': "=?"
        },
        templateUrl: "/web-app/partials/listLoans.html",
        link: function postLink($scope) {
            // variables
            $scope.loans = [];
            $scope.displayedLoans = [];
            if ($scope.table) $scope.query = $scope.table;
            else
                $scope.query = {
                    order: "startDate",
                    limit: 10,
                    page: 1,
                    aborted: $scope.aborted,
                    returned: $scope.returned,
                    progress: $scope.progress,
                    overdue: $scope.overdue,
                    filter: ""
                }
            $scope.request;
            // functions bingins
            $scope.toDisplay = toDisplay;
            $scope.copyLoan = copyLoan;
            $scope.returnLoan = returnLoan;
            $scope.checkStatus = checkStatus;
            // watchers
            $scope.$watch("query.returned", function () {
                filter();
            })
            $scope.$watch("query.aborted", function () {
                filter();
            })
            $scope.$watch("query.progress", function () {
                filter();
            })
            $scope.$watch("query.overdue", function () {
                filter();
            })
            $scope.$watch("query.filter", function () {
                filter();
            })
            $scope.$watch('refresh', function () {
                if ($scope.refresh) refresh();
            })
            // functions
            function toDisplay(column) {
                if ($scope.source == column) return false;
                else return true;
            }
            function copyLoan(loan) {
                const clonedLoan = angular.copy(loan);
                delete clonedLoan._id;
                LoanService.edit(clonedLoan).then(function () { refresh() });
            }
            function returnLoan(loan) {
                LoanService.returned(loan, function () { refresh() });
            }

            function refresh() {
                $scope.request = LoanService.getList($scope.filters);
                $scope.request.then(function (promise) {
                    $scope.loans = promise;
                    $scope.loans.forEach(function (loan) {
                        checkStatus(loan);
                    })
                    filter();
                    $scope.refresh = false;
                });
            }

            function checkStatus(loan) {
                if (loan.aborted) loan.status = "aborted";
                else if (loan.endDate) loan.status = "returned";
                else if (new Date(loan.estimatedEndDate) > new Date()) loan.status = "progress";
                else loan.status = "overdue";
            }
            function filter() {
                $scope.displayedLoans = [];
                $scope.loans.forEach(function (loan) {
                    if (
                        (($scope.query.returned && loan.status == "returned")
                            || ($scope.query.aborted && loan.status == "aborted")
                            || ($scope.query.progress && loan.status == "progress")
                            || ($scope.query.overdue && loan.status == "overdue")
                        ) && ($scope.query.filter == ""
                            || loan.companyId.name.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                            || loan.contactId.name.toLowerCase().indexOf($scope.query.filter) >= 0
                            || loan.contactId.email.toLowerCase().indexOf($scope.query.filter) >= 0
                            || loan.ownerId.name.first.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                            || loan.ownerId.name.last.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0))
                        $scope.displayedLoans.push(loan);
                })
            }

        }
    };
};

function listDevices(DeviceService) {
    return {
        restrict: 'E',
        scope: {
            'filters': "=",
            'refresh': "=",
            'devices': "=?",
            'source': "@?",
            'loaned': "=?",
            'lost': "=?",
            'available': "=?",
        },
        templateUrl: "/web-app/partials/listDevices.html",
        link: function postLink($scope) {
            // variables
            $scope.devices = [];
            $scope.displayedDevices = [];
            $scope.query = {
                order: "serialNumber",
                limit: 10,
                page: 1,
                loaned: $scope.loaned,
                lost: $scope.lost,
                available: $scope.available,
                filter: ""
            }
            $scope.request;

            // functions bindings
            $scope.toDisplay = toDisplay;
            $scope.editDevice = editDevice;
            $scope.copyDevice = copyDevice;
            $scope.remove = remove;
            // watchers
            $scope.$watch("query.loaned", function () {
                filter();
            })
            $scope.$watch("query.lost", function () {
                filter();
            })
            $scope.$watch("query.available", function () {
                filter();
            })
            $scope.$watch("query.filter", function () {
                filter();
            })
            $scope.$watch('refresh', function () {
                if ($scope.refresh) refresh();
            })
            // functions
            function toDisplay(column) {
                if ($scope.source == column) return false;
                else return true;
            }
            function refresh() {
                $scope.request = DeviceService.getList($scope.filters)
                $scope.request.then(function (promise) {
                    $scope.displayedDevices = $scope.devices = promise;
                    filter();
                    $scope.refresh = false;
                });
            }
            function filter() {
                $scope.displayedDevices = [];
                $scope.devices.forEach(function (device) {
                    if (
                        (($scope.query.loaned && device.loanId)
                            || ($scope.query.lost && device.lost)
                            || ($scope.query.available && (!device.lost && !device.loanId))
                        ) && ($scope.query.filter == ""
                            || device.hardwareId.model.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                            || device.serialNumber.indexOf($scope.query.filter) >= 0
                            || device.macAddress.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0))
                        $scope.displayedDevices.push(device);
                })
            }

            function editDevice(device) {
                DeviceService.edit(device).then(function () {
                    refresh();
                });
            }
            function copyDevice(device) {
                const clonedDevice = angular.copy(device);
                delete clonedDevice._id;
                DeviceService.edit(clonedDevice).then(function () {
                    refresh();
                });
            }
            function remove(device) {
                DeviceService.remove(device._id).then(function(){refresh()});             
            }

        }
    };
};


function listContacts(ContactService) {
    return {
        restrict: 'E',
        scope: {
            'filters': "=",
            'refresh': "=",
            'contacts': "=?",
            'source': "@?"
        },
        templateUrl: "/web-app/partials/listContacts.html",
        link: function postLink($scope) {
            // variables
            $scope.contacts = [];
            $scope.displayedContacts = [];
            $scope.query = {
                order: "name",
                limit: 10,
                page: 1,
                filter: ""
            }
            // functions bindings
            $scope.toDisplay = toDisplay;
            $scope.edit = edit;
            $scope.remove = remove;
            
            // watchers
            $scope.$watch("query.filter", function () {
                filter();
            })

            $scope.$watch('refresh', function () {
                if ($scope.refresh) refresh();
            })
            // functions
            function toDisplay(column) {
                if ($scope.source == column) return false;
                else return true;
            }
            function filter() {
                $scope.displayedContacts = [];
                $scope.contacts.forEach(function (contact) {
                    if ($scope.query.filter == ""
                        || contact.name.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                        || contact.email.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0
                        || contact.phone.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0)
                        $scope.displayedContacts.push(contact);
                })
            }
            function edit(contact) {
                ContactService.edit(contact).then(function () { refresh() });
            }
            function remove(contact) {
                ContactService.remove(contact._id).then(function(){refresh()});
            }
            function refresh() {
                $scope.request = ContactService.getList($scope.filters)
                $scope.request.then(function (promise) {
                    $scope.contacts = promise;
                    filter();
                    $scope.refresh = false;
                });
            }
        }
    };
};


function listComments($mdDialog, ErrorService) {
    return {
        restrict: 'E',
        scope: {
            'object': "=",
            'service': "="
        },
        templateUrl: "/web-app/partials/comments.html",
        link: function ($scope) {
            // variables
            $scope.divHeight = 200;
            $scope.divStyle = { 'max-height': '200px', 'overflow': 'auto' };
            // functions binding
            $scope.more = more;
            $scope.less = less;
            $scope.new = newComment;
            // functions
            function more() {
                $scope.divHeight += 200;
                $scope.divStyle['max-height'] = $scope.divHeight + "px";
            }
            function less() {
                $scope.divHeight -= 200;
                $scope.divStyle['max-height'] = $scope.divHeight + "px";
            }

            function reload() {
                $scope.service.getById($scope.object._id).then(function (promise) {
                    if (promise && promise.error) ErrorService.display(promise.error);
                    else {
                        $scope.object = promise[0];
                    }
                });
            }

            function newComment() {
                $mdDialog.show({
                    controller: 'NewComment',
                    templateUrl: 'modals/newComment.html',
                    locals: {
                        items: {
                            object: $scope.object,
                            service: $scope.service
                        }
                    }
                }).then(function (promise) {
                    reload();
                });
            }
        }
    };
};