angular
    .module('Contact')
    .controller('ContactListCtrl', contactListCtrl)
    .controller('ContactEditCtrl', contactEditCtrl)

function contactListCtrl(ContactService) {
    var contactList = this;
    // variables
    contactList.refreshRequested = true;

    // function bindings
    contactList.edit = edit;
    contactList.refresh = refresh;

    // function
    function edit() {
        ContactService.edit().then(function () {
            refresh();
        });
    }

    function refresh() {
        contactList.refreshRequested = true;
    }
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
        var master = { companyId: null, name: "", phone: "", email: "" };
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