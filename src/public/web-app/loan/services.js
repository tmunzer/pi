angular.module('Loan').service("LoanService", function ($http, $q) {

    function create(loan) {
        let id;
        if (loan._id) id = loan._id;
        else id = "";
        var canceller = $q.defer();
        var request = $http({
            url: "/api/loans/" + id,
            method: "POST",
            data: { loan: loan },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function postComment(id, comment) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/loans/" + id + "/comment",
            method: "POST",
            data: { comment: comment },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function getList(search) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/loans",
            method: "GET",
            params: search,
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function get(loan_id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/loans/" + loan_id,
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function getById(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/loans",
            method: "GET",
            params: { id: id },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function remove(id) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/loans/" + id,
            method: "DELETE",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function httpReq(request) {
        var promise = request.then(
            function (response) {
                return response.data;
            },
            function (response) {
                if (response.status >= 0) return { error: response.data };
            });

        promise.abort = function () {
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
        postComment: postComment,
        getList: getList,
        remove: remove,
        get: get,
        getById: getById
    }
});


