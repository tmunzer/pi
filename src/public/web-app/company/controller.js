angular.module('Company').controller('CompaniesListCtrl', function ($scope, $routeParams, $mdDialog, CompanyService) {

    $scope.companies = [];
    $scope.displayedCompanies = [];
    $scope.query = {
        order: "name",
        limit: 10,
        page: 1,
        pageSelect: 1,
        filter: ""
    }
    $scope.request;
    $scope.$watch("query.filter", function () {
        filter();
    })
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

    function filter() {
        $scope.displayedCompanies = [];
        $scope.companies.forEach(function (company) {
            if ($scope.query.filter == ""
                || company.name.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0)
                $scope.displayedCompanies.push(company);
        })
    }

    $scope.edit = function (company) {
        $mdDialog.show({
            controller: 'CompaniesEditCtrl',
            templateUrl: 'company/edit.html',
            locals: {
                items: company
            }
        }).then(function () {
            $scope.refresh();
        });
    }

    $scope.refresh = function () {
        $scope.request = CompanyService.getList();
        $scope.request.then(function (promise) {
            if (promise && promise.error) displayError(promise);
            else {
                $scope.companies = promise;
                filter();
            }
        });
    }

    $scope.refresh();
});


angular.module('Company').controller('CompaniesDetailsCtrl', function ($scope, $routeParams, $mdDialog, CompanyService) {
    $scope.company;
    $scope.filters;

    var companyId;

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
    $scope.editDevice = function () {
        $mdDialog.show({
            controller: 'CompaniesEditCtrl',
            templateUrl: 'company/edit.html',
            locals: {
                items: $scope.device
            }
        }).then(function () {
            loadDevice();
        });
    }

    function loadCompany() {
        CompanyService.get($routeParams.company_id).then(function (promise) {
            if (promise.error) displayError(promise);
            else {
                $scope.company = promise;
                companyId = promise._id;
                $scope.filters = { companyId: companyId };
                $scope.refreshContacts();
                $scope.refreshLoans();
            }
        });
    }
    loadCompany();

    $scope.refreshRequestedLoans = false;
    $scope.refreshLoans = function () {
        $scope.refreshRequestedLoans = true;
    }
    $scope.refreshRequestedContacts = false;
    $scope.refreshContacts = function () {
        $scope.refreshRequestedContacts = true;
    }
});


angular.module('Company').controller('CompaniesEditCtrl', function ($scope, $mdDialog, items, CompanyService) {
    // items is injected in the controller, not its scope!   
    console.log(items) 
    if (items && items._id) {
        $scope.action = "Edit";
        var master = items;
    } else if (items) {
        $scope.action = "Clone";
        var master = items;
    } else {
        $scope.action = "Add";
        var master = { name: "" };
    }
    
    $scope.reset = function () {
        $scope.company = angular.copy(master);
    };

    $scope.reset();

    $scope.save = function (company) {
        CompanyService.create(company).then(function (promise) {
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

});