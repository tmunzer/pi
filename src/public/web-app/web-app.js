angular.module('Hardware', []);
angular.module('Device', []);
angular.module('Loan', []);
angular.module('Company', []);
angular.module('Contact', []);
angular.module('User', []);
angular.module("CustomFilters", []);
angular.module("Modals", []);
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
    'Modals'
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
