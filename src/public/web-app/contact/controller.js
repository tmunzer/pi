angular
.module('Contact')
.controller('ContactListCtrl', ContactListCtrl)
.controller('ContactsEditCtrl',ContactsEditCtrl)
 function ContactListCtrl(ContactService) {
var contactList = this;
    $scope.edit = function () {
        $mdDialog.show({
            controller: 'ContactsEditCtrl',
            controllerAs: 'contactsEdit',
            templateUrl: 'contact/edit.html',
            locals: {
                items: null
            }
        }).then(function () {
            $scope.refresh();
        });
    }

    $scope.refreshRequested = true;
    $scope.refresh = function () {
        $scope.refreshRequested = true;
    }




function ContactsEditCtrl($scope, $mdDialog, items, CompanyService, ContactService, ErrorService) {
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
        var master = { companyId: null, name: "", phone: "", email: "" };
    }
    if (master.companyId && master.companyId._id) master.companyId = master.companyId._id;
    CompanyService.getList().then(function (promise) {
        if (promise && promise.error) ErrorService.display(promise.error);
        else $scope.companies = promise;
    })

    $scope.reset = function () {
        $scope.contact = angular.copy(master);
    };

    $scope.reset();

    $scope.save = function () {
        ContactService.create($scope.contact).then(function (promise) {
            $mdDialog.hide();
            if (promise && promise.error) ErrorService.display(promise.error);
        })
    };
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };

