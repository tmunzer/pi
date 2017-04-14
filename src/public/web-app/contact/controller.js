angular.module('Contact').controller('ContactListCtrl', function ($scope, $routeParams, $mdDialog, ContactService) {

    $scope.contacts = [];
    $scope.displayedContacts = [];
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
        $scope.displayedContacts = [];
        $scope.contacts.forEach(function (contact) {
            if ($scope.query.filter == ""
                || company.name.toLowerCase().indexOf($scope.query.filter.toLowerCase()) >= 0)
                $scope.displayedCompanies.push(company);
        })
    }

    $scope.editLoan = function (loan) {
        $mdDialog.show({
            controller: 'UserEditCtrl',
            templateUrl: 'user/edit.html',
            locals: {
                items: null
            }
        }).then(function () {
            $scope.refresh();
        });
    }

    $scope.refresh = function () {
        $scope.request = ContactService.getList();
        $scope.request.then(function (promise) {
            if (promise && promise.error) displayError(promise);
            else {
                $scope.contacts = promise;
                filter();
            }
        });
    }

    $scope.refresh();
});