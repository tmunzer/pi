angular.module('pi').config(function ($routeProvider) {
    $routeProvider
        .when("/dashboard", {
            templateUrl: "/web-app/dashboard/view.html",
            module: "Dashboard",
            controller: "DashboardCtrl",
            controllerAs: 'dashboard'
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
        .when("/admin", {
            templateUrl: "/web-app/partials/admin.html"
        })
        .when("/settings/accounts", {
            templateUrl: "/web-app/user/list.html",
            controller: "UserListCtrl"
        })
        .when("/settings/accounts/:user_id", {
            templateUrl: "/web-app/user/details.html",
            controller: "UserDetailsCtrl"
        })
        .when("/companies", {
            templateUrl: "/web-app/company/list.html",
            controller: "CompanyListCtrl",
            controllerAs: "companyList"
        })
        .when("/companies/:company_id", {
            templateUrl: "/web-app/company/details.html",
            controller: "CompanyDetailsCtrl",
            controllerAs: "companyDetails"
        })
        .when("/contacts", {
            templateUrl: "/web-app/contact/list.html",
            controller: "ContactListCtrl"
        })
        .otherwise({
            redirectTo: "/dashboard/"
        })
});