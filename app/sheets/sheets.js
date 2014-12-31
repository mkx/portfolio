angular.module('portfolioApp.sheets', [
    'ngStorage',
    'ui.router'
])

        .config(
                ['$stateProvider',
                    function ($stateProvider) {
                        $stateProvider
                                .state('sheets', {
                                    url: '/sheets',
                                    templateUrl: 'sheets/sheets.html',
                                    controller: 'SheetsCtrl'
                                });
                    }])
        .controller('SheetsCtrl',
                ['$scope', '$state', '$rootScope', '$http', '$localStorage',
                    function ($scope, $state, $rootScope, $http, $localStorage) {
                        if (!$rootScope.token) {
                            $state.go('unauthorized');
                            return;
                        }
                        
                        if ($rootScope.sheetContentSrc || 
                                $localStorage.sheetContentSrc) {
                            $state.go('portfolio');
                            return;
                        }
                                                
                        // load list of all spreadsheets
                        var url = 'https://spreadsheets.google.com/feeds/spreadsheets/private/full';
                        var config = {
                            method: 'JSONP',
                            url: url,
                            params: {
                                v: '3.0',
                                access_token: $rootScope.token.access_token,
                                callback: 'JSON_CALLBACK'
                            }
                        };
                        $http(config).
                        success(function(data) {
                            x2js = new X2JS();                            
                            $scope.result = x2js.xml_str2json(data);
                            $scope.sheets = $scope.result.feed.entry;
                            //console.log($scope.sheets);
                        }).
                        error(function(data, status, headers, config) {
                           console.log('Error: ' + status);
                        });
                        
                        $scope.setSheetContentSrc = function(sheetId) {
                            $rootScope.sheetContentSrc = sheetId;
                            $state.go('portfolio');
                        };
                    }]);