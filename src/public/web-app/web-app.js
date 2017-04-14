angular.module('Hardware', []);
angular.module('Device', []);
angular.module('Loan', []);
angular.module('Company', []);
angular.module('Contact', []);
angular.module('User', []);
angular.module('Company', []);
angular.module("CustomFilters", []);
angular.module("Modals", []);
angular.module("Partials", []);
var pi = angular.module("pi", [
    "ngRoute",
    'ui.bootstrap',
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'md.data.table',
    'Hardware',
    'Device',
    'Loan',
    'Company',
    'Contact',
    'User',
    'Company',
    'CustomFilters',
    'Modals',
    'Partials'
]);


pi
    .config(function ($mdThemingProvider) {
        $mdThemingProvider
            .theme('default')
            .primaryPalette('deep-orange')
            .accentPalette('grey')
            .warnPalette('red')
            .backgroundPalette('grey');
    })
    .controller("TabCtrl", function ($scope, $location) {
        $scope.selectedIndex = 0;
        $scope.goto = function (location) {
            $location.url("/" + location);
        }
        $scope.$on('$routeChangeStart', function (next, current) {
            if ($location.path().indexOf("/dashboard") == 0) $scope.selectedIndex = 0;
            else if ($location.path().indexOf("/loans") == 0) $scope.selectedIndex = 1;
            else if ($location.path().indexOf("/hardwares") == 0) $scope.selectedIndex = 3;
            else if ($location.path().indexOf("/devices") == 0) $scope.selectedIndex = 4;
            else if ($location.path().indexOf("/companies") == 0) $scope.selectedIndex = 6;
            else if ($location.path().indexOf("/contacts") == 0) $scope.selectedIndex = 7;
            else $scope.selectedIndex = -1;
        })
    })
    .controller("SearchCtrl", function ($scope, $location, $timeout, HardwareService, DeviceService, LoanService, CompanyService, ContactService) {
        $scope.search = "";
        $scope.results = [];
        $scope.selected = null;
        var hardwares = [];
        var devices = [];
        var loans = [];
        var companies = [];
        var contacts = [];

        $scope.$watch("selected", function () {
            if ($scope.selected) {
                if ($scope.selected.type) $location.url("/hardwares/" + $scope.selected.model)
                else if ($scope.selected.serialNumber) $location.url("/devices/" + $scope.selected.serialNumber)
                else if ($scope.selected.companyId) $location.url("/contacts/" + $scope.selected._id)
                else if ($scope.selected.name) $location.url("/companies/" + $scope.selected._id)
                $scope.selected = null;

            }
        })
        function refresh() {
            $scope.results = [];
            if (hardwares) {
                $scope.results.push.apply($scope.results, [{ 'separator': "Hardwares (" + hardwares.length + ")" }]);
                $scope.results.push.apply($scope.results, hardwares);
            }
            if (devices) {
                $scope.results.push.apply($scope.results, [{ 'separator': "Devices (" + devices.length + ")" }]);
                $scope.results.push.apply($scope.results, devices);
            }
            if (companies) {
                $scope.results.push.apply($scope.results, [{ 'separator': "Companies (" + companies.length + ")" }]);
                $scope.results.push.apply($scope.results, companies);
            }
            if (contacts) {
                $scope.results.push.apply($scope.results, [{ 'separator': "Contacts (" + contacts.length + ")" }]);
                $scope.results.push.apply($scope.results, contacts);
            }
        }

        let lastRequest;
        var hardwareRequest;
        var deviceRequest;
        var companyRequest;
        var contactRequest;

        function update() {
            if (hardwareRequest) hardwareRequest.abort();
            if (deviceRequest) deviceRequest.abort();
            if (companyRequest) companyRequest.abort();
            if (contactRequest) contactRequest.abort();

            hardwareRequest = HardwareService.getList({ search: $scope.search })
            hardwareRequest.then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    hardwares = promise;
                    refresh();
                }
            })
            deviceRequest = DeviceService.getList({ search: $scope.search });
            deviceRequest.then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    devices = promise;
                    refresh();
                }
            })
            companyRequest = CompanyService.getList({ search: $scope.search });
            companyRequest.then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    companies = promise;
                    refresh();
                }
            })
            contactRequest = ContactService.getList({ search: $scope.search });
            contactRequest.then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    contacts = promise;
                    refresh();
                }
            })
        }

        var searchTemp = '';
        var searchTimeout;
        $scope.$watch("search", function (val) {
            if ($scope.search && $scope.search.length > 0) {
                if (searchTimeout) $timeout.cancel(searchTimeout);

                searchTemp = $scope.search;
                searchTimeout = $timeout(function () {
                    if (searchTemp == $scope.search) update();
                }, 100); // delay 250 ms

            }
        })
    })


    .controller("MenuCtrl", function ($scope, $mdDialog) {
        var originatorEv;

        this.openMenu = function ($mdMenu, ev) {
            originatorEv = ev;
            $mdMenu.open(ev);
        };
        $scope.addHardware = function () {
            $mdDialog.show({
                controller: 'HardwareEditCtrl',
                templateUrl: 'hardware/edit.html',
                locals: {
                    items: null
                }
            });
        }
        $scope.addDevice = function () {
            $mdDialog.show({
                controller: 'DeviceEditCtrl',
                templateUrl: 'device/edit.html',
                locals: {
                    items: null
                }
            });
        }
        $scope.addLoan = function () {
            $mdDialog.show({
                controller: 'LoanEditCtrl',
                templateUrl: 'loan/edit.html',
                locals: {
                    items: null
                }
            });
        }
    });
