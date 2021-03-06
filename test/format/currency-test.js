var expect = require('chai').expect;
var formatCurrency = require('../../lib/format/currency');
var currencies = require('../../lib/data/currencies');

var customCurrencies = {
    'CUSTOM': {
        prefix: 'CUS ',
        suffix: ' CUS',
        precision: 4,
        decimalSeparator: '%',
        groupingSeparator: '?',
        groupingSize: 2
    }
};

describe("format/currency()", function() {
    it('formats currencies', function() {
        expect(formatCurrency(123456)).to.equal('123456.00');
        expect(formatCurrency(123456.78)).to.equal('123456.78');
        expect(formatCurrency(123456.7891)).to.equal('123456.79');

        expect(formatCurrency(123456, {currency: 'FOO'})).to.equal('123456.00 FOO');
        expect(formatCurrency(123456.78, {currency: 'FOO'})).to.equal('123456.78 FOO');
        expect(formatCurrency(123456.7891, {currency: 'FOO'})).to.equal('123456.79 FOO');

        expect(formatCurrency(123456, {currencies: currencies, currency: 'USD'})).to.equal('$123456.00');
        expect(formatCurrency(123456.78, {currencies: currencies, currency: 'USD'})).to.equal('$123456.78');
        expect(formatCurrency(123456.7891, {currencies: currencies, currency: 'USD'})).to.equal('$123456.79');

        // after
        expect(formatCurrency(123456, {currencies: currencies, currency: 'ARS'})).to.equal('$123456.00 ARS');
        expect(formatCurrency(123456.78, {currencies: currencies, currency: 'ARS'})).to.equal('$123456.78 ARS');
        expect(formatCurrency(123456.7891, {currencies: currencies, currency: 'ARS'})).to.equal('$123456.79 ARS');

        // precision
        expect(formatCurrency(123456, {currencies: currencies, currency: 'BTC'})).to.equal('123456.0000 BTC');
        expect(formatCurrency(123456.78, {currencies: currencies, currency: 'BTC'})).to.equal('123456.7800 BTC');
        expect(formatCurrency(123456.7891, {currencies: currencies, currency: 'BTC'})).to.equal('123456.7891 BTC');

        expect(formatCurrency(123456, {currencies: currencies, currency: 'JPY'})).to.equal('¥123456');
        expect(formatCurrency(123456.78, {currencies: currencies, currency: 'JPY'})).to.equal('¥123457');
        expect(formatCurrency(123456.7891, {currencies: currencies, currency: 'JPY'})).to.equal('¥123457');

        // custom currency
        expect(formatCurrency(123456, {currency: 'CUSTOM', currencies: customCurrencies})).to.equal('CUS 12?34?56%0000 CUS');
        expect(formatCurrency(123456.78, {currency: 'CUSTOM', currencies: customCurrencies})).to.equal('CUS 12?34?56%7800 CUS');
        expect(formatCurrency(123456.789666, {currency: 'CUSTOM', currencies: customCurrencies})).to.equal('CUS 12?34?56%7897 CUS');

        // unknown currency
        expect(formatCurrency(123456, {currencies: currencies, currency: 'FOO'})).to.equal('123456.00 FOO');
        expect(formatCurrency(123456.78, {currencies: currencies, currency: 'FOO'})).to.equal('123456.78 FOO');
        expect(formatCurrency(123456.7891, {currencies: currencies, currency: 'FOO'})).to.equal('123456.79 FOO');
    });

    it('can be configured', function() {
        var format = formatCurrency.configure({currencies: currencies, currency: 'USD'});

        expect(format(123456)).to.equal('$123456.00');
        expect(format(123456.78)).to.equal('$123456.78');
        expect(format(123456.7891)).to.equal('$123456.79');
    });
});
