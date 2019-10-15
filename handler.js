'use strict';

const axios = require('axios');
const _ = require('lodash');

module.exports.surfReport = async () => {

    let start = Date.now();
    console.log('Starting processing');

    // Retrieves the timeSeries array for each requested reading.
    async function getRiverData() {
        const res = await axios.get('https://waterservices.usgs.gov/nwis/iv/?format=json&sites=02035000,02037500&period=P1D&parameterCd=00010,00065');
        return res.data.value.timeSeries;
    }

    function processTimeSeries(timeSeriesValue) {

        return {
            site: timeSeriesValue.sourceInfo.siteName,
            valueType: timeSeriesValue.variable.variableCode.variableDescription,
            units: timeSeriesValue.variable.unit.unitCode,
            latestValue: parseFloat(_.last(timeSeriesValue.values[0].value).value)
        };
    }

    console.log('Calling USGS');
    const data = await getRiverData();

    console.log('Processing data');
    const riverData = _.reduce(data, (result, value) => {
        result.values.push(processTimeSeries(value));
        return result;
    }, {values: []});

    let stop = Date.now();
    console.log('Total invocation time: ' + (stop - start) + 'ms');
    return {
        statusCode: 200,
        body: JSON.stringify(riverData)
    };


};
