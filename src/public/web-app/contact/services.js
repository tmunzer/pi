angular.module('Contact').service("ContactService", function ($http, $q, $mdDialog, ErrorService) {
    function edit(contact) {
        return $mdDialog.show({
            controller: 'ContactEditCtrl',
            controllerAs: 'contactEdit',
            templateUrl: 'contact/edit.html',
            locals: {
                items: contact
            }
        })
    }
    function create(contact) {
        let id;
        if (contact._id) id = contact._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts/" + id,
            method: "POST",
            data: { contact: contact },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getList(search) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts",
            method: "GET",
            params: search,
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function get(contact_id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts/" + contact_id,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function getById(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/contacts",
            method: "GET",
            params: { id: id },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function remove(id) {
        return $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Contact" }
            }
        }).then(function () {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/contacts/" + id,
                method: "DELETE",
                timeout: canceller.promise
            });
            httpReq(request);
        })

    }

    function httpReq(request) {
        var canceller = $q.defer();
        request.timout = canceller.promise;
        var promise = request.then(
            function (response) {
                return response.data;
            },
            function (response) {
                if (response.status >= 0) ErrorService.display(response.data);
            });

        promise.abort = function () {
            canceller.resolve("aborted");
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        edit: edit,
        create: create,
        getList: getList,
        remove: remove,
        get: get,
        getById: getById
    }
});