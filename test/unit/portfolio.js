describe('PortfolioCtrl', function(){
    
    var scope, ctrl, $httpBackend, $localStorage;

    beforeEach(function () {
        module('portfolioApp.portfolio');
        module('portfolioApp.templates');
        module('gapiMock');
    });

    beforeEach(inject(function ($state, $rootScope, _$httpBackend_, _$localStorage_, $controller) {
        $localStorage = _$localStorage_;
        $localStorage.$reset();
        // let's assume that user selected a valid spreadsheet
        $localStorage.sheetContentSrc = 'PORTFOLIO';        
        
        $httpBackend = _$httpBackend_;
        $httpBackend.expectJSONP('PORTFOLIO?access_token=FAKE_ACCESS_TOKEN&callback=JSON_CALLBACK&v=3.0').
                respond(spreadsheetFullXml);

        $httpBackend.expectJSONP("https://spreadsheets.google.com/feeds/list/PORTFOLIO/SHEET1/private/full?v=3.0&access_token=FAKE_ACCESS_TOKEN&callback=JSON_CALLBACK&v=3.0")
                .respond(worksheet1Xml);
        $httpBackend.expectJSONP("https://spreadsheets.google.com/feeds/list/PORTFOLIO/SHEET2/private/full?v=3.0&access_token=FAKE_ACCESS_TOKEN&callback=JSON_CALLBACK&v=3.0")
                .respond(worksheet2Xml);
        $httpBackend.expectJSONP("https://spreadsheets.google.com/feeds/list/PORTFOLIO/SHEET3/private/full?v=3.0&access_token=FAKE_ACCESS_TOKEN&callback=JSON_CALLBACK&v=3.0")
                .respond(worksheet3Xml);
        
        $httpBackend.expectJSONP("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22ABCD.DE%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK")
                .respond(yahooQuoteResponse);
        
        $httpBackend.expectJSONP("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22ABCD.DE%22%20and%20startDate%20%3D%20%222014-10-31%22%20and%20endDate%20%3D%20%222015-01-04%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK")
                .respond({});

        scope = $rootScope.$new();
        
        ctrl = $controller('PortfolioCtrl', {$scope: scope});
    }));

    it('should have a portfolio', inject(function ($controller, $rootScope) {
        expect(scope.portfolio).toBeTruthy();
    }));

    it('should have a default order function', inject(function ($controller, $rootScope) {
        expect(scope.orderProp).toBeTruthy();
    }));

    it('should have a order by performance desc function', inject(function ($controller, $rootScope) {
        expect(scope.orderByPerfDesc).toBeTruthy();
        expect(scope.orderByPerfDesc({performance:Big(-1)})).toBe(1.0);
    }));
    
    it('should load a spreadsheet', inject(function ($controller, $rootScope) {
        expect(scope.sheets.loading).toBeTruthy();
        $httpBackend.flush();
        expect(scope.sheets.loading).toBeFalsy();
        expect(scope.sheets.worksheetsFound).toBe(3);
        expect(scope.sheets.worksheetsLoaded).toBe(3);
        expect(scope.positions.length).toBe(1);
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));
});