angular.module('portfolioApp.sheets', [
    'gapi',
    'ngStorage',
    'spreadsheetModule',
    'ui.router'
])

        .config(
                ['$stateProvider',
                    function ($stateProvider) {
                        $stateProvider
                                .state('sheets', {
                                    url: '/sheets',
                                    templateUrl: 'sheets/sheets.html',
                                    controller: 'SheetsCtrl',
                                    resolve: {
                                        promiseToken: function(gapiService) {
                                            return gapiService.promiseToken();
                                        }
                                    }
                                });
                    }])
        .controller('SheetsCtrl',
                ['$scope', '$state', 'spreadsheetService', '$http', '$localStorage',
                    function ($scope, $state, spreadsheetService, $http, $localStorage) {
                        
                        if ($localStorage.sheetContentSrc) {
                            $state.go('portfolio');
                            return;
                        }
                                                
                        // load list of all spreadsheets
                        spreadsheetService.loadSpreadsheets().
                        success(function(data) {
                            x2js = new X2JS();                            
                            $scope.result = x2js.xml_str2json(data);
                            $scope.sheets = $scope.result.feed.entry;
                        }).
                        error(function(data, status, headers, config) {
                           console.log('Error: ' + status);
                        });
                        
                        $scope.setSheetContentSrc = function(sheetId) {
                            $rootScope.sheetContentSrc = sheetId;
                            $state.go('portfolio');
                        };
                    }]);