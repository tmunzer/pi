angular
    .module('Company')
    .controller('CompaniesListCtrl', companiesListCtrl)
    .controller('CompaniesDetailsCtrl', companiesDetailsCtrl)
    .controller('CompaniesEditCtrl', companiesEditCtrl)


function companiesListCtrl($scope, $mdDialog, CompanyService, ErrorService) {
    var companiesList = this;
    // variables
    companiesList.companies = [];
    companiesList.displayedCompanies = [];
    companiesList.query = {
        order: "name",
        limit: 10,
        page: 1,
        filter: ""
    }
    companiesList.request;
    // functions bindings
    companiesList.edit = edit;
    companiesList.remove = remove;
    companiesList.refresh = refresh;

    // watchers
    $scope.$watch("companiesList.query.filter", function () {
        filter();
    })

    //functions
    function filter() {
        companiesList.displayedCompanies = [];
        companiesList.companies.forEach(function (company) {
            if (companiesList.query.filter == ""
                || company.name.toLowerCase().indexOf(companiesList.query.filter.toLowerCase()) >= 0)
                companiesList.displayedCompanies.push(company);
        })
    }

    function edit(company) {
        $mdDialog.show({
            controller: 'CompaniesEditCtrl',
            controllerAs: 'companiesEdit',
            templateUrl: 'company/edit.html',
            locals: {
                items: company
            }
        }).then(function () {
            refresh();
        });
    }

    function remove(company) {
        $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Comany" }
            }
        }).then(function () {
            CompanyService.remove(company._id).then(function (promise) {
                if (promise && promise.error) ErrorService.display(promise.error);
                else refresh()
            })
        });
    }

    function refresh() {
        companiesList.request = CompanyService.getList();
        companiesList.request.then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                companiesList.companies = promise;
                filter();
            }
        });
    }

    //init
    refresh();
}


function companiesDetailsCtrl($scope, $routeParams, $mdDialog, CompanyService, ErrorService) {
    var companiesDetails = this;

    // variables
    companiesDetails.company;
    companiesDetails.filters;
    companiesDetails.loans;
    companiesDetails.contacts;
    companiesDetails.query = {
        aborted: true,
        returned: true,
        progress: true,
        overdue: true
    }
    companiesDetails.loansStatus = {};
    companiesDetails.contactsTotal = 0;
    companiesDetails.refreshRequestedLoans = false;
    companiesDetails.refreshRequestedContacts = false;

    var companyId;
    // functions bindings
    companiesDetails.edit = edit;
    companiesDetails.refreshLoans = refreshLoans;
    companiesDetails.refreshContacts = refreshContacts;

    // watchers
    $scope.$watch("contacts", function () {
        if (companiesDetails.contacts) companiesDetails.contactsTotal = companiesDetails.contacts.length;
    })
    $scope.$watch("companiesDetails.loans", function () {
        if (companiesDetails.loans && companiesDetails.loans.length > 0) {
            companiesDetails.loansStatus = {
                ended: 0,
                progress: 0,
                overdue: 0,
                aborted: 0,
                total: 0
            };
            companiesDetails.loans.forEach(function (loan) {
                if (loan.aborted) companiesDetails.loansStatus.aborted++;
                else if (loan.endDate) companiesDetails.loansStatus.ended++;
                else if (new Date(loan.estimatedEndDate) < new Date()) companiesDetails.loansStatus.overdue++;
                else companiesDetails.loansStatus.progress++
                companiesDetails.loansStatus.total++
            })
        }
    })


    // functions
    function edit() {
        $mdDialog.show({
            controller: 'CompaniesEditCtrl',
            controllerAs: 'companiesEdit',
            templateUrl: 'company/edit.html',
            locals: {
                items: companiesDetails.company
            }
        }).then(function () {
            loadCompany();
        });
    }

    function loadCompany() {
        CompanyService.get($routeParams.company_id).then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                companiesDetails.company = promise;
                companyId = promise._id;
                companiesDetails.filters = { companyId: companyId };
                refreshContacts();
                refreshLoans();
            }
        });
    }
    function refreshLoans() {
        companiesDetails.refreshRequestedLoans = true;
    }
    function refreshContacts() {
        companiesDetails.refreshRequestedContacts = true;
    }
    // init
    loadCompany();

}


function companiesEditCtrl($mdDialog, items, CompanyService, ErrorService) {
    var companiesEdit = this;

    // items is injected in the controller, not its scope!   
    if (items && items._id) {
        companiesEdit.action = "Edit";
        var master = items;
    } else if (items) {
        companiesEdit.action = "Clone";
        var master = items;
    } else {
        companiesEdit.action = "Add";
        var master = { name: "" };
    }

    // functions bindings
    companiesEdit.reset = reset;
    companiesEdit.save = save;
    companiesEdit.cancel = cancel;
    companiesEdit.close = close;

    //functions
    function reset() {
        companiesEdit.company = angular.copy(master);
    };
    function save(company) {
        CompanyService.create(company).then(function (promise) {
            $mdDialog.hide();
            if (promise && promise.error) ErrorService.display(promise.error);
        })
    };
    function cancel() {
        $mdDialog.cancel()
    };
    function close() {
        $mdDialog.hide();
    };

    //init
    reset();
}