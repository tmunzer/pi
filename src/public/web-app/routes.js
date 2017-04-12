angular.module('pi').config(function ($routeProvider) {
    $routeProvider
        .when("/dashboard", {
            templateUrl: "/web-app/partials/dashboard.html"
        })
        .when("/devices", {
            templateUrl: "/web-app/device/list/view.html",
            module: "Device",
            controller: "DeviceListCtrl"
        })
        .when("/devices/:serialNumber", {
            templateUrl: "/web-app/device/details/view.html",
            module: "Device",
            controller: "DeviceDetailsCtrl"
        })
        .when("/devices/model/:hardwareId", {
            templateUrl: "/web-app/device/list/view.html",
            module: "Device",
            controller: "DeviceListCtrl"
        })
        .when("/loans", {
            templateUrl: "/web-app/loan/list/view.html",
            module: "Loan",
            controller: "LoanListCtrl"
        })
        .when("/loans/:loanId", {
            templateUrl: "/web-app/loan/details/view.html",
            module: "Loan",
            controller: "LoanDetailsCtrl"
        })
        .when("/hardwares", {
            templateUrl: "/web-app/hardware/list/view.html",
            controller: "HardwareListCtrl"
        })
        .when("/hardwares/:model", {
            templateUrl: "/web-app/hardware/details/view.html",
            controller: "HardwareDetailsCtrl"
        })
        .when("/user", {
            templateUrl: "/web-app/partials/user.html"
        })
        .when("/admin", {
            templateUrl: "/web-app/partials/admin.html"
        })
        .otherwise({
            redirectTo: "/dashboard/"
        })
});