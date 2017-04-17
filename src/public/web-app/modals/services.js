angular.module('Modals').service("ErrorService", function ($mdDialog) {
    function display(error) {
        console.log(error);
        $mdDialog.show({
            controller: 'ErrorCtrl',
            templateUrl: 'modals/error.html',
            locals: {
                items: error.errmsg
            }
        });
    };
    return {
        display: display
    }
})
