function GapiLauncher($window, authorizedState, unauthorizedState, $state, $q) {
    
    var internals = {
        clientId: '452740701559-g79app3t387662f3a7j7j002ueqervjv.apps.googleusercontent.com',
        apiKey: 'V4pAvT7D8MRkbaEWnxZxkBoY',
        scopes: 'https://spreadsheets.google.com/feeds',
        
        triedOnce: false,
    
        token: null,
    
        setApiKey: function () {
            // Step 2: Reference the API key
            gapi.client.setApiKey(internals.apiKey);
            $window.setTimeout(internals.checkAuth, 1);
        },

        checkAuth: function () {
            gapi.auth.authorize(
                {
                    client_id: internals.clientId,
                    scope: internals.scopes,
                    immediate: true
                },
            internals.handleAuthResult);
        },

        handleAuthResult: function (authResult) {
            internals.triedOnce = true;
            if (authResult && !authResult.error) {
                internals.token = gapi.auth.getToken();
                $state.go(authorizedState);
                console.log('Authorized');
            } else {
                internals.token = null;
                $state.go(unauthorizedState);
                console.log('Unauthorized');
            }
        }
    };

    this.authorize = function () {
        // Step 3: get authorization to use private data
        gapi.client.setApiKey(this.apiKey);
        gapi.auth.authorize(
                {
                    client_id: internals.clientId,
                    scope: internals.scopes,
                    immediate: false
                },
                internals.handleAuthResult);
        return false;
    };
    
    if ($window.gapiInitialized) {
        internals.setApiKey();
    } else {
        $window.initGapi = function() {
            internals.setApiKey();
        };
    }
    
    this.getToken = function () {
        if (!internals.triedOnce) {
            console.log('Calling token before first auth try.');
        }
        return internals.token;
    };
    
    this.promiseToken = function() {
        return $q(function(resolve, reject) {
            setTimeout(function() {
                if (internals.token) {
                    resolve(internals.token);
                } else {
                    console.log('Failed to promise token.');
                    reject(null);
                }
            }, 1000);
        });
    };
}

angular.module('gapi', ['portfolioApp', 'ui.router']).service('gapiService',
        [
            '$window',
            'authorizedState',
            'unauthorizedState',
            '$state',
            '$q',
            GapiLauncher
        ]);


// Global
var initGoogleApi = function() {
    if (window.initGapi) {
        window.initGapi();
    } else {
        window.gapiInitialized = true;
    }
};
