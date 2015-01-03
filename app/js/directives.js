angular.module('portfolioApp')
        .directive('chart', function () {

            // constants
            var 
                    color = d3.interpolateRgb("#f77", "#77f");

            return {
                restrict: 'E',
                scope: {
                    val: '=',
                },
                link: function (scope, element, attrs) {

                    // set up initial svg object
                    var vis = d3.select(element[0])
                            .append("svg");
                    
                    if (!attrs.yvalue) {
                        attrs.yvalue = 'value';
                    }
                    
                    if (!attrs.type) {
                        attrs.type = 'line';
                    }
                    
                    vis.selectAll('*').remove();

                    var chart = c3.generate({
                        bindto: vis,
                        data: {
                            x: 'date',
                            columns: []
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                tick: {
                                    count: 3,
                                    //culling: {
                                    //    max: 3
                                    //},
                                    fit: true,
                                    format: '%Y-%m-%d'
                                }
                            }
                        },
                        legend: {
                            show: false
                        },
                        point: {
                            show: false
                        },
                        padding: {
                            top: 0,
                            left: 50,
                            right: 50,
                            bottom: 0
                        },
                        size: {
                            width: element.parent().width(),
                            height: element.parent().height()
                        }
                    });
                    
                    var redraw = function() {
                        
                        if (!scope.val) {
                            return;
                        }
                        
                        chart.load({columns: scope.val.filter(function(s) {
                            return s[0] === 'date' || s[0] === attrs.series;
                        })});                        
                    };

                    scope.$watch('val', function (newVal, oldVal) {
                        redraw();
                    });
                    
                }
            };
        });