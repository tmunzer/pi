angular.module('User')
    .controller('UserListCtrl', userListCtrl)
    .controller('UserDetailsCtrl', userDetailsCtrl)
    .controller('UserEditCtrl', userEditCtrl)
    .controller('PasswordCtrl', passwordCtrl)

function userListCtrl($scope, UserService) {
    var userList = this;
    // variables
    userList.users = [];
    userList.myId;
    userList.displayedUsers = [];
    userList.query = {
        order: "name.email",
        limit: 10,
        page: 1,
        filter: ""
    }
    userList.request;
    // watchers
    $scope.$watch("query.filter", function () {
        filter();
    })
    // functions bindings
    userList.edit = edit;
    userList.lock = lock;
    userList.unlock = unlock;
    userList.refresh = refresh;
    // functions
    function filter() {
        userList.displayedUsers = [];
        userList.users.forEach(function (user) {
            if (userList.query.filter == ""
                || user.name.first.toLowerCase().indexOf(userList.query.filter.toLowerCase()) >= 0
                || user.name.last.toLowerCase().indexOf(userList.query.filter) >= 0
                || user.email.toLowerCase().indexOf(userList.query.filter) >= 0)
                userList.displayedUsers.push(user);
        })
    }
    function edit(user) {
        UserService.edit(user, refresh);
    }
    function lock(user) {
        UserService.lock(user, refresh);
    }
    function unlock(user) {
        UserService.unlock(user, refresh);
    }
    function refresh() {
        userList.request = UserService.getList();
        userList.request.then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else {
                userList.myId = promise.currentUser;
                userList.users = promise.users;
                filter();
            }
        });
    }
    // init
    refresh();
};


function userDetailsCtrl($scope, $routeParams, $mdDialog, UserService) {
    var userDetails = this;
    // variables
    userDetails.user;
    userDetails.devices;
    userDetails.loans;
    userDetails.queryLoans = {
        aborted: true,
        returned: true,
        progress: true,
        overdue: true
    };
    userDetails.queryDevices = {
        loaned: true,
        returned: false,
        lost: false,
        available: true
    };
    userDetails.refreshRequested = false;
    userDetails.hideColumn = ['owner'];
    const userId = $routeParams.user_id;
    if ($routeParams.user_id == "me") userDetails.me = true;
    // functions bindings
    userDetails.edit = edit;
    userDetails.changePassword = changePassword;
    // functions
    function edit() {
        UserService.edit(userDetails.user, refresh);
    }

    function changePassword() {
        UserService.password(userDetails.user);
    }
    function refreshLists() {
        userDetails.refreshRequested = true;
    }
    function refresh() {
        UserService.getById(userId).then(function (promise) {
            if (promise.error) displayError(promise);
            else {
                userDetails.user = promise;
                userDetails.filters = { ownerId: promise._id };
                refreshLists();
            }
        });
    }
    // init
    refresh()
};



function userEditCtrl($mdDialog, items, UserService) {
    var userEdit = this;
    // items is injected in the controller, not its scope!   
    // variables
    if (items && items._id) {
        userEdit.action = "Edit";
        var master = items;
    } else {
        userEdit.action = "Add";
        var master = { email: "", phone: "", name: { first: "", last: "" }, password: "", enabled: true };
    }
    // functions bindings
    userEdit.close = close;
    userEdit.cancel = cancel;
    userEdit.reset = reset;
    userEdit.save = save;
    // functions
    function save() {
        UserService.create(userEdit.user).then(function (promise) {
            if (promise) close();
        })
    };
    function reset() {
        userEdit.user = angular.copy(master);
    };
    function cancel() {
        $mdDialog.cancel()
    };
    function close(promise) {
        $mdDialog.hide(promise);
    };
    // init
    reset();
};

function passwordCtrl($mdDialog, items, UserService) {
    var password = this;
    // items is injected in the controller, not its scope!
    password.user = items.user;
    password.value = "";
    password.cancel = cancel;
    password.save = save;


    function save() {
        UserService.changePassword(password.user._id, password.value).then(function (promise) {
            if (promise) $mdDialog.hide();
        })
    }
    function cancel() {
        $mdDialog.cancel()
    };
};