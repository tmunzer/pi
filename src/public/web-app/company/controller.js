angular
    .module('Company')
    .controller('CompanyListCtrl', companyList)
    .controller('CompanyDetailsCtrl', companyDetailsCtrl)
    .controller('CompanyEditCtrl', companyEditCtrl)


function companyList($scope, $mdDialog, CompanyService, ErrorService) {
    var companyList = this;
    // variables
    companyList.companies = [];
    companyList.displayedCompanies = [];
    companyList.query = {
        order: "name",
        limit: 10,
        page: 1,
        filter: ""
    }
    companyList.request;
    // functions bindings
    companyList.edit = edit;
    companyList.remove = remove;
    companyList.refresh = refresh;

    // watchers
    $scope.$watch("companyList.query.filter", function () {
        filter();
    })

    //functions
    function filter() {
        companyList.displayedCompanies = [];
        companyList.companies.forEach(function (company) {
            if (companyList.query.filter == ""
                || company.name.toLowerCase().indexOf(companyList.query.filter.toLowerCase()) >= 0)
                companyList.displayedCompanies.push(company);
        })
    }

    function edit(company) {
        $mdDialog.show({
            controller: 'CompanyEditCtrl',
            controllerAs: 'companyEdit',
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
        companyList.request = CompanyService.getList();
        companyList.request.then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                companyList.companies = promise;
                filter();
            }
        });
    }

    //init
    refresh();
}


function companyDetailsCtrl($scope, $routeParams, $mdDialog, CompanyService, ErrorService) {
    var companyDetails = this;

    // variables
    companyDetails.company;
    companyDetails.filters;
    companyDetails.loans;
    companyDetails.contacts;
    companyDetails.query = {
        aborted: true,
        returned: true,
        progress: true,
        overdue: true
    }
    companyDetails.loansStatus = {};
    companyDetails.contactsTotal = 0;
    companyDetails.refreshRequestedLoans = false;
    companyDetails.refreshRequestedContacts = false;

    var companyId;
    // functions bindings
    companyDetails.edit = edit;
    companyDetails.refreshLoans = refreshLoans;
    companyDetails.refreshContacts = refreshContacts;

    // watchers
    $scope.$watch("contacts", function () {
        if (companyDetails.contacts) companyDetails.contactsTotal = companyDetails.contacts.length;
    })
    $scope.$watch("companyDetails.loans", function () {
        if (companyDetails.loans && companyDetails.loans.length > 0) {
            companyDetails.loansStatus = {
                ended: 0,
                progress: 0,
                overdue: 0,
                aborted: 0,
                total: 0
            };
            companyDetails.loans.forEach(function (loan) {
                if (loan.aborted) companyDetails.loansStatus.aborted++;
                else if (loan.endDate) companyDetails.loansStatus.ended++;
                else if (new Date(loan.estimatedEndDate) < new Date()) companyDetails.loansStatus.overdue++;
                else companyDetails.loansStatus.progress++
                companyDetails.loansStatus.total++
            })
        }
    })


    // functions
    function edit() {
        $mdDialog.show({
            controller: 'CompanyEditCtrl',
            controllerAs: 'companyEdit',
            templateUrl: 'company/edit.html',
            locals: {
                items: companyDetails.company
            }
        }).then(function () {
            loadCompany();
        });
    }

    function loadCompany() {
        CompanyService.get($routeParams.company_id).then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                companyDetails.company = promise;
                companyId = promise._id;
                companyDetails.filters = { companyId: companyId };
                refreshContacts();
                refreshLoans();
            }
        });
    }
    function refreshLoans() {
        companyDetails.refreshRequestedLoans = true;
    }
    function refreshContacts() {
        companyDetails.refreshRequestedContacts = true;
    }
    // init
    loadCompany();

}


function companyEditCtrl($mdDialog, items, CompanyService, ErrorService) {
    var companyEdit = this;

    // items is injected in the controller, not its scope!   
    if (items && items._id) {
        companyEdit.action = "Edit";
        var master = items;
    } else if (items) {
        companyEdit.action = "Clone";
        var master = items;
    } else {
        companyEdit.action = "Add";
        var master = { name: "" };
    }

    // functions bindings
    companyEdit.reset = reset;
    companyEdit.save = save;
    companyEdit.cancel = cancel;
    companyEdit.close = close;

    //functions
    function reset() {
        companyEdit.company = angular.copy(master);
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