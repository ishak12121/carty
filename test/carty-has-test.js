var assert = require('chai').assert;
var carty = typeof window !== 'undefined' ? window.carty : require('../lib/carty');

describe("carty().has()", function() {
    var cart;

    beforeEach(function() {
        cart = carty();
        cart.add({id: 'Item'});
    });

    it("returns true for existing item", function(done) {
        cart
            .ready(function(cart) {
                assert.isTrue(cart.has({id: 'Item'}));
                done();
            })
        ;
    });

    it("returns true for existing item passed as string", function(done) {
        cart
            .ready(function(cart) {
                assert.isTrue(cart.has('Item'));
                done();
            })
        ;
    });

    it("returns true for existing item passed as item()", function(done) {
        cart
            .ready(function(cart) {
                assert.isTrue(cart.has(cart.item('Item')));
                done();
            })
        ;
    });

    it("returns false for missing item", function(done) {
        cart
            .ready(function(cart) {
                assert.isFalse(cart.has({id: 'Missing'}));
                done();
            })
        ;
    });

    it("returns false for missing item passed as string", function(done) {
        cart
            .ready(function(cart) {
                assert.isFalse(cart.has('Missing'));
                done();
            })
        ;
    });

    it("returns false for invalid item", function(done) {
        cart
            .ready(function(cart) {
                assert.isFalse(cart.has({}));
                assert.isFalse(cart.has({foo: 'bar'}));
                assert.isFalse(cart.has([]));
                assert.isFalse(cart.has(null));
                assert.isFalse(cart.has(undefined));

                done();
            })
        ;
    });

    it("ignores quantity", function(done) {
        cart
            .add({id: 'Item with quantity', quantity: 1})
            .ready(function(cart) {
                assert.isTrue(cart.has({id: 'Item with quantity', quantity: 2}));
                done();
            })
        ;
    });
});
