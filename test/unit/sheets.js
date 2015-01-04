
describe('SheetsCtrl', function () {
    var scope, ctrl, $httpBackend, $localStorage;

    beforeEach(function() {
        module('portfolioApp');
        module('portfolioApp.templates');
        module('gapiMock');
    });

    beforeEach(inject(function ($state, $rootScope, _$httpBackend_, _$localStorage_, $controller) {
        $localStorage = _$localStorage_;
        $localStorage.$reset();
        $httpBackend = _$httpBackend_;
        $httpBackend.expectJSONP('https://spreadsheets.google.com/feeds/spreadsheets/private/full?access_token=FAKE_ACCESS_TOKEN&callback=JSON_CALLBACK&v=3.0').
                respond(spreadsheetsFullXml);

        scope = $rootScope.$new();
        ctrl = $controller('SheetsCtrl', {$scope: scope});
    }));
    
    it('should have a setSheetContentSrc function', function () {
        expect(scope.setSheetContentSrc).toBeTruthy();
    });
    
    it('fills sheet list', function() {
        $httpBackend.flush();
        expect(scope.sheets.length).toBe(2);
    });

});

