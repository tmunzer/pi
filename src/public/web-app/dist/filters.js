angular.module("CustomFilters").filter("objectId", function () {
    return function (input) {
        return 'ObjectId('+input+')';
    }
});

angular.module("CustomFilters").filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});