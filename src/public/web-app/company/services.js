angular.module('Company').factory("CompanyService", function ($http, $q, $mdDialog, ErrorService) {
    function edit(company, cb) {
        company = angular.copy(company);
        return $mdDialog.show({
            controller: 'CompanyEditCtrl',
            controllerAs: 'companyEdit',
            templateUrl: 'company/edit.html',
            locals: {
                items: company
            }
        }).then(function () {
            cb();
        });
    }
    function create(company) {
        let id;
        if (company._id) id = company._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/companies/" + id,
            method: "POST",
            data: { company: company },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getList(search) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/companies",
            method: "GET",
            params: search,
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function get(company_id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/companies/" + company_id,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getById(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/companies",
            method: "GET",
            params: { id: id },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function remove(id, cb) {
        return $mdDialog.show({
            controller: 'ConfirmCtrl',
            templateUrl: 'modals/confirm.html',
            locals: {
                items: { item: "Company" }
            }
        }).then(function () {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/companies/" + id,
                method: "DELETE",
                timeout: canceller.promise
            });
            httpReq(request).then(function (promise) {
              cb();
            });
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
            console.info("Cleaning up object references.");
            canceller.resolve();
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