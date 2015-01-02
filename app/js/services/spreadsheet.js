function SpreadsheetService($http, $q, gapiService, yahooService, portfolio) {
    var x2js = new X2JS();
    
    var sheetData = {
        worksheetsFound: 0,
        worksheetsLoaded: 0,
        loading: false
    };
    
    this.data = sheetData;
    
    var isDone = function (data) {
        return data.worksheetsFound && 
                (data.worksheetsLoaded === data.worksheetsFound);
    };

    var processWorksheet = function (data) {
        var result = x2js.xml_str2json(data);
        var rows = result.feed.entry;
        var len = rows.length;
        for (var i = 0; i < len; i++) {
            var row = rows[i];
            if (!row.symbol.__text) {
                // TODO make this work w/o relying
                // on internals
                continue;
            }

            if (row.yahoo) {
                // this is part of the mapping table
                yahooService.addMapping(
                        row.symbol.toString(),
                        row.yahoo.toString()
                        );
                continue;
            }

            var convertToBig = function (number) {
                if (!number) {
                    return Big(0);
                }
                var val = number.toString();
                var commaAt = val.indexOf(',');
                var pointAt = val.indexOf('.');
                if (commaAt !== -1 &&
                        pointAt === -1) {
                    // simple conversion from German to US
                    val = val.replace(',', '.');
                } else if (commaAt !== -1 &&
                        pointAt !== -1 &&
                        pointAt < commaAt) {
                    // 'tausender-trennzeichen' 1.000,00
                    val = val.replace('.', '');
                    val = val.replace(',', '.');
                }
                var regex = new RegExp("[-0-9.]+");
                return Big(regex.exec(val));
            };
            convertToDate = function (date) {
                if (!date) {
                    return null;
                }
                var val = date.toString();
                if (val.indexOf('.') !== -1) {
                    result = moment(val, "DD.MM.YYYY");
                    if (result.isValid()) {
                        return result;
                    } // else try default conversion
                }
                return moment(val);
            };
            var transaction = {
                type: row.type && row.type.toString() || 'BUY',
                valuta: convertToDate(row.valuta),
                execution: convertToDate(row.execution),
                label: row.label.toString(),
                value: convertToBig(row.value),
                symbol: row.symbol.toString(),
                stocks: convertToBig(row.stocks),
                currency: row.currency && row.currency.toString(),
                price: convertToBig(row.price)
            };
            portfolio.addTransaction(transaction);
        }
        sheetData.worksheetsLoaded++;
        if (isDone(sheetData)) {
            yahooService.queryYahoo();
        }
    };

    var loadWorksheets = function (data) {
        var result = x2js.xml_str2json(data);
        var worksheets = result.feed.entry;
        var len = worksheets.length;
        sheetData.worksheetsFound = len;
        sheetData.loading = false;
        for (var i = 0; i < len; i++) {
            // start loading all the worksheets
            var url = worksheets[i].content._src;
            var config = {
                method: 'JSONP',
                url: url,
                params: {
                    v: '3.0',
                    access_token: gapiService.getToken().access_token,
                    callback: 'JSON_CALLBACK'
                }
            };
            $http(config)
                    .success(processWorksheet)
                    .error(function (data, status, headers, config) {
                        console.log('Error: ' + status);
                    });
        }
    };

    this.loadSpreadsheet = function (sheetUrl) {
        if (sheetData.loading || sheetData.worksheetsFound > 0) {
            return ;
        }
        sheetData.loading = true;
        // load data from spreadsheet
        var url = sheetUrl;
        var config = {
            method: 'JSONP',
            url: url,
            params: {
                v: '3.0',
                access_token: gapiService.getToken().access_token,
                callback: 'JSON_CALLBACK'
            }
        };
        $http(config)
                .success(loadWorksheets)
                .error(function (data, status, headers, config) {
                    console.log('Error: ' + status);
                });
    };
}

angular.module('spreadsheetModule', ['gapi']).service('spreadsheetService',
        [
            '$http',
            '$q',
            'gapiService',
            'yahooService',
            'portfolio',
            SpreadsheetService
        ]);



