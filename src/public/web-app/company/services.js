angular.module('Company').service("CompanyService", function ($http, $q) {
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

    function remove(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/companies/" + id,
            method: "DELETE",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function httpReq(request) {
        var canceller = $q.defer();
        request.timout = canceller.promise;
        var promise = request.then(
            function (response) {
                return response.data;
            },
            function (response) {
                if (response.status >= 0) {
                    console.log("error");
                    console.log(response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            console.info("sqdsqCleaning up object references.");
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
        create: create,
        getList: getList,
        remove: remove,
        get: get
    }
});