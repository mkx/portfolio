function GapiLauncher(authorizedState, unauthorizedState, $state, $q) {
    
    var token = {
        access_token: 'FAKE_ACCESS_TOKEN'
    };
    
    this.getToken = function () {
        return token;
    };
    
    this.promiseToken = function() {
        return $q(function(resolve, reject) {
            setTimeout(function() {
                resolve(token);
            }, 1000);
        });
    };
}

angular.module('gapiMock', ['portfolioApp', 'ui.router']).service('gapiService',
        [
            'authorizedState',
            'unauthorizedState',
            '$state',
            '$q',
            GapiLauncher
        ]);



