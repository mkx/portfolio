
describe('SheetsCtrl', function () {
    var scope, ctrl, $httpBackend, $localStorage;

    beforeEach(module('portfolioApp'));

    beforeEach(inject(function ($state, $rootScope, _$httpBackend_, _$localStorage_, $controller) {
        $localStorage = _$localStorage_;
        $localStorage.$reset();
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('phones/phones.json').
                respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

        scope = $rootScope.$new();
        scope.token = 'A token';
        ctrl = $controller('SheetsCtrl', {$rootScope: scope, $scope: scope});
    }));
    
    it('should have a setSheetContentSrc function', function () {
        expect(scope.setSheetContentSrc).toBeTruthy();
    });

});

