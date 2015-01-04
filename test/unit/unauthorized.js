describe('UnauthorizedCtrl', function(){

    beforeEach(function () {
        module('portfolioApp.unauthorized');
    });

    it('should have a authorize function', inject(function ($controller, $rootScope) {
        var scope = $rootScope.$new();
        
        var ctrl = $controller('UnauthorizedCtrl', {$scope: scope, gapiservice: {}});

        expect(scope.authorize).toBeTruthy();
    }));

});