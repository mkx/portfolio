angular.module('portfolioApp.unauthorized', [
    'ui.router'
])
        .config(
                ['$stateProvider',
                    function ($stateProvider) {
                        $stateProvider
                                .state('unauthorized', {
                                    url: '/',
                                    templateUrl: 'unauthorized/unauthorized.html',
                                    controller: 'UnauthorizedCtrl'
                                });
                    }
                ])
        .controller('UnauthorizedCtrl',
                ['$scope', '$state', '$rootScope',
                    // Controller
                    function ($scope, $state, $rootScope) {
                        $scope.clientId = '452740701559-g79app3t387662f3a7j7j002ueqervjv.apps.googleusercontent.com';

                        $scope.apiKey = 'V4pAvT7D8MRkbaEWnxZxkBoY';

                        $scope.scopes = 'https://spreadsheets.google.com/feeds';

                        // This should try to check for existing token
                        // Step 2: Reference the API key
                        //gapi.client.setApiKey($scope.apiKey);
                        //window.setTimeout($scope.checkAuth, 1);

                        $scope.checkAuth = function () {
                            gapi.auth.authorize({client_id: $scope.clientId, scope: $scope.scopes, immediate: true}, handleAuthResult);
                        }

                        $scope.handleAuthResult = function (authResult) {
                            if (authResult && !authResult.error) {
                                $rootScope.token = gapi.auth.getToken();
                                $state.go('sheets');
                            }
                        }

                        $scope.authorize = function () {
                            // Step 3: get authorization to use private data
                            gapi.client.setApiKey($scope.apiKey);
                            gapi.auth.authorize({client_id: $scope.clientId, scope: $scope.scopes, immediate: false}, $scope.handleAuthResult);
                            return false;
                        }

                    }]
                );




