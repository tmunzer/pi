angular.module('Hardware', []);
angular.module('Device', []);
angular.module('Loan', []);
angular.module('Company', []);
angular.module('Contact', []);
angular.module('User', []);
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
            else if ($location.path().indexOf("/hardwares") == 0) $scope.selectedIndex = 1;
            else if ($location.path().indexOf("/devices") == 0) $scope.selectedIndex = 2;
            else if ($location.path().indexOf("/loans") == 0) $scope.selectedIndex = 3;
            else $scope.selectedIndex = -1;
        })
    })
    .controller("SearchCtrl", function ($scope,$location, HardwareService, DeviceService, LoanService, CompanyService, ContactService) {
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
            $scope.results.push.apply($scope.results, [{ 'separator': "Hardwares (" + hardwares.length + ")" }]);
            $scope.results.push.apply($scope.results, hardwares);
            $scope.results.push.apply($scope.results, [{ 'separator': "Devices (" + devices.length + ")" }]);
            $scope.results.push.apply($scope.results, devices);
            $scope.results.push.apply($scope.results, [{ 'separator': "Companies (" + companies.length + ")" }]);
            $scope.results.push.apply($scope.results, companies);
            $scope.results.push.apply($scope.results, [{ 'separator': "Contacts (" + contacts.length + ")" }]);
            $scope.results.push.apply($scope.results, contacts);
        }

        $scope.$watch("search", function () {
            if ($scope.search && $scope.search.length > 0)
                HardwareService.getList({ search: $scope.search }).then(function (promise) {
                    if (promise && promise.error) console.log(promise.error)
                    else {
                        hardwares = promise;
                        refresh();
                    }
                })
            DeviceService.getList({ search: $scope.search }).then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    devices = promise;
                    refresh();
                }
            })
            CompanyService.getList({ search: $scope.search }).then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    companies = promise;
                    refresh();
                }
            })
            ContactService.getList({ search: $scope.search }).then(function (promise) {
                if (promise && promise.error) console.log(promise.error)
                else {
                    contacts = promise;
                    refresh();
                }
            })
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
                templateUrl: 'hardware/edit/view.html',
                locals: {
                    items: null
                }
            });
        }
        $scope.addDevice = function () {
            $mdDialog.show({
                controller: 'DeviceEditCtrl',
                templateUrl: 'device/edit/view.html',
                locals: {
                    items: null
                }
            });
        }
        $scope.addLoan = function () {
            $mdDialog.show({
                controller: 'LoanEditCtrl',
                templateUrl: 'loan/edit/view.html',
                locals: {
                    items: null
                }
            });
        }
    });
