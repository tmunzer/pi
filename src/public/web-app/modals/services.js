angular.module('Modals').service("ErrorService", function ($mdDialog) {
    
    function display(error) {
        $mdDialog.hide();
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
