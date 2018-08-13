angular
    .module('Contact')
    .controller('ContactListCtrl', contactListCtrl)
    .controller('ContactDetailsCtrl', contactDetailsCtrl)
    .controller('ContactEditCtrl', contactEditCtrl);

function contactListCtrl(ContactService) {
    var contactList = this;
    // variables
    contactList.refreshRequested = true;

    // function bindings
    contactList.edit = edit;
    contactList.refresh = refresh;

    // function
    function edit() {
        ContactService.edit(null, refresh);
    }

    function refresh() {
        contactList.refreshRequested = true;
    }
}

function contactDetailsCtrl($scope, $routeParams, ContactService, LoanService) {
    var contactDetails = this;

    // variables
    contactDetails.filters;
    contactDetails.loans;
    contactDetails.query = {
        aborted: true,
        returned: true,
        progress: true,
        overdue: true
    };
    contactDetails.loansStatus = {};
    contactDetails.refreshRequestedLoans = false;
    contactDetails.refreshRequestedContacts = false;

    var contactId;
    // functions bindings
    contactDetails.edit = edit;
    contactDetails.refreshLoans = refreshLoans;
    contactDetails.newLoan = newLoan;
    // watchers
    $scope.$watch("contactDetails.loans", function () {
        if (contactDetails.loans && contactDetails.loans.length > 0) {
            contactDetails.loansStatus = {
                ended: 0,
                progress: 0,
                overdue: 0,
                aborted: 0,
                total: 0
            };
            contactDetails.loans.forEach(function (loan) {
                if (loan.aborted) contactDetails.loansStatus.aborted++;
                else if (loan.endDate) contactDetails.loansStatus.ended++;
                else if (new Date(loan.estimatedEndDate) < new Date()) contactDetails.loansStatus.overdue++;
                else contactDetails.loansStatus.progress++;
                    contactDetails.loansStatus.total++;
            });
        }
    });
    // functions
    function edit() {
        ContactService.edit(contactDetails.contact, refresh);
    }

    function newLoan() {
        LoanService.edit({
            contactId: contactDetails.contact._id
        }, refreshLoans);
    }

    function refreshLoans() {
        contactDetails.refreshRequestedLoans = true;
    }

    function refresh() {
        ContactService.get($routeParams.contact_id).then(function (promise) {
            contactDetails.contact = promise;
            contactId = promise._id;
            contactDetails.filters = {
                contactId: contactId
            };
            refreshLoans();

        });
    }
    // init
    refresh();
}

function contactEditCtrl($mdDialog, items, CompanyService, ContactService) {
    var contactEdit = this;
    // variables
    // items is injected in the controller, not its scope!   
    if (items && items._id) {
        contactEdit.action = "Edit";
        var master = items;
    } else if (items) {
        contactEdit.action = "Clone";
        var master = items;
    } else {
        contactEdit.action = "Add";
        var master = {
            companyId: null,
            name: "",
            phone: "",
            email: ""
        };
    }
    if (master.companyId && master.companyId._id) master.companyId = master.companyId._id;
    CompanyService.getList().then(function (promise) {
        contactEdit.companies = promise;
    })

    // function bindings
    contactEdit.reset = reset;
    contactEdit.save = save;
    contactEdit.cancel = cancel;
    contactEdit.close = close

    function reset() {
        contactEdit.contact = angular.copy(master);
    };

    function save() {
        ContactService.create(contactEdit.contact).then(function (promise) {
            if (promise) close();
        })
    };

    function cancel() {
        $mdDialog.cancel()
    };

    function close() {
        $mdDialog.hide();
    };

    // init
    reset();
}