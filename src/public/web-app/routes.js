angular.module('pi').config(function ($routeProvider) {
    $routeProvider
        .when("/dashboard", {
            templateUrl: "/web-app/partials/dashboard.html"
        })
        .when("/devices", {
            templateUrl: "/web-app/device/list.html",
            module: "Device",
            controller: "DeviceListCtrl"
        })
        .when("/devices/:serialNumber", {
            templateUrl: "/web-app/device/details.html",
            module: "Device",
            controller: "DeviceDetailsCtrl"
        })
        .when("/loans", {
            templateUrl: "/web-app/loan/list.html",
            module: "Loan",
            controller: "LoanListCtrl"
        })
        .when("/loans/:loanId", {
            templateUrl: "/web-app/loan/details.html",
            module: "Loan",
            controller: "LoanDetailsCtrl"
        })
        .when("/hardwares", {
            templateUrl: "/web-app/hardware/list.html",
            controller: "HardwareListCtrl"
        })
        .when("/hardwares/:model", {
            templateUrl: "/web-app/hardware/details.html",
            controller: "HardwareDetailsCtrl"
        })
        .when("/user", {
            templateUrl: "/web-app/partials/user.html"
        })
        .when("/admin", {
            templateUrl: "/web-app/partials/admin.html"
        })
        .when("/settings/accounts", {
            templateUrl: "/web-app/user/list.html",
            controller: "UsersListCtrl"
        })
        .when("/settings/companies", {
            templateUrl: "/web-app/company/list.html",
            controller: "CompaniesListCtrl"
        })
        .when("/settings/companies/:company_id", {
            templateUrl: "/web-app/company/details.html",
            controller: "CompaniesDetailsCtrl"
        })
        .when("/settings/contacts", {
            templateUrl: "/web-app/contact/list.html",
            controller: "ContactListCtrl"
        })
        .otherwise({
            redirectTo: "/dashboard/"
        })
});