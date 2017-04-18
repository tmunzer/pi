angular.module('Modals').service("ErrorService", function ($mdDialog) {

    function display(error) {
        $mdDialog.hide();
        console.log(error);
        let message;
        if (error && error.errmsg) message = error.errmsg;
        else if (error && error.message) message = error.message;
        else message = "Unknown error. Please check your console";
        $mdDialog.show({
            controller: 'ErrorCtrl',
            templateUrl: 'modals/error.html',
            locals: {
                items: message
            }
        });
    };
    return {
        display: display
    }
})
