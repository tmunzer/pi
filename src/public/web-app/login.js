var login = angular.module('login', [
    'ngMaterial', 'ngSanitize'
]);

login
    .config(function ($mdThemingProvider) {
        $mdThemingProvider
            .theme('default')
            .primaryPalette('deep-orange')
            .accentPalette('grey')
            .warnPalette('red')
            .backgroundPalette('grey');
    });

login.controller('LoginCtrl', function ($scope) {


});

