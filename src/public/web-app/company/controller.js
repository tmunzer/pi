angular
    .module('Company')
    .controller('CompanyListCtrl', companyList)
    .controller('CompanyDetailsCtrl', companyDetailsCtrl)
    .controller('CompanyEditCtrl', companyEditCtrl)


function companyList($scope, CompanyService) {
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
        CompanyService.edit(company).then(function () {
            refresh();
        });
    }

    function remove(company) {
        CompanyService.remove(company._id).then(function (promise) {
            refresh()
        })
    }

    function refresh() {
        companyList.request = CompanyService.getList();
        companyList.request.then(function (promise) {
            companyList.companies = promise;
            filter();
        });
    }

    //init
    refresh();
}


function companyDetailsCtrl($scope, $routeParams, CompanyService) {
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
        CompanyService.edit().then(function () {
            refresh();
        });
    }

    function refresh() {
        CompanyService.get($routeParams.company_id).then(function (promise) {
                companyDetails.company = promise;
                companyId = promise._id;
                companyDetails.filters = { companyId: companyId };
                refreshContacts();
                refreshLoans();
            
        });
    }
    function refreshLoans() {
        companyDetails.refreshRequestedLoans = true;
    }
    function refreshContacts() {
        companyDetails.refreshRequestedContacts = true;
    }
    // init
    refresh();

}


function companyEditCtrl($mdDialog, items, CompanyService) {
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
        CompanyService.create(companyEdit.company).then(function (promise) {
            close();
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