'use strict';

var extend = require('extend');
var emitter = require('./util/emitter');
var number = require('./util/number');
var property = require('./util/property');
var value = require('./util/value');
var createItem = require('./item');

var resolve = Promise.resolve.bind(Promise);
var reject = Promise.reject.bind(Promise);

var _defaultOptions = {
    storage: null,
    currency: 'USD',
    shipping: null,
    tax: null
};

function createCart(options) {
    var _options = extend({}, _defaultOptions, options);
    var _storage = _options.storage;
    var _items = [];
    var _ready = load();

    function cart() {
        return _items.slice(0);
    }

    var emit = emitter(cart);

    cart.ready = function(onReady) {
        ready(onReady);
        return cart;
    };

    cart.error = function(onError) {
        error(onError);
        return cart;
    };

    cart.option = property.bind(cart, _options);

    cart.size = function() {
        return _items.length;
    };

    cart.has = function(item) {
        return !!has(item);
    };

    cart.get = function(item) {
        var found = has(item);
        return !found ? null : found.item;
    };

    cart.add = function(item) {
        ready(add.bind(cart, item));

        return cart;
    };

    cart.remove = function(item) {
        ready(remove.bind(cart, item));

        return cart;
    };

    cart.clear = function() {
        ready(clear);

        return cart;
    };

    cart.each = function(callback, context) {
        _items.every(function(item, index) {
            return false !== callback.call(context, item, index, cart);
        });

        return cart;
    };

    cart.quantity = function() {
        return cart().reduce(function(previous, item) {
            return previous + item.quantity();
        }, 0);
    };

    cart.subtotal = function() {
        return cart().reduce(function(previous, item) {
            return previous + (item.price() * item.quantity());
        }, 0);
    };

    cart.currency = function() {
        return _options.currency;
    };

    cart.shipping = function() {
        if (!cart.size()) {
            return 0;
        }

        return cart().reduce(function(previous, item) {
            return previous + item.shipping();
        }, number(value(_options.shipping, cart)));
    };

    cart.tax = function() {
        if (!cart.size()) {
            return 0;
        }

        return cart().reduce(function(previous, item) {
            return previous + item.tax();
        }, number(value(_options.tax, cart)));
    };

    cart.total = function() {
        return cart.subtotal() + cart.tax() + cart.shipping();
    };

    function ready(onReady) {
        _ready['catch'](function(e) {
            setTimeout(function() { throw e; });
        });

        _ready = _ready.then(function() {
            return onReady(cart);
        });
    }

    function error(onError) {
        _ready = _ready['catch'](function(e) {
            return onError(e, cart);
        });
    }

    function load() {
        return resolve(
            _storage ? _storage.load() : []
        ).then(function(items) {
            if (Array.isArray(items)) {
                _items = items.map(function(attr) {
                    return createItem(attr);
                });
            }
        });
    }

    function has(attr) {
        var checkItem, found = false;

        try {
            checkItem = createItem(attr);
        } catch (e) {
            return false;
        }

        _items.every(function(item, index) {
            if (checkItem.equals(item)) {
                found = {item: item, index: index};
            }

            return !found;
        });

        return found;
    }

    function add(attr) {
        var item = createItem(attr);

        if (!emit('add', item)) {
            return;
        }

        var existing = has(item);

        if (existing) {
            item = createItem(extend({}, existing.item(), item(), {
                quantity: existing.item.quantity() + item.quantity()
            }));
        }

        if (item.quantity() < 1) {
            return remove(item);
        }

        if (existing) {
            _items[existing.index] = item;
        } else {
            _items.push(item);
        }

        return resolve(
            _storage ? _storage.add(item, cart) : null
        ).then(emit.bind(cart, 'added', item), function(e) {
            emit('addfailed', e, item);
            return reject(e);
        });
    }

    function remove(attr) {
        var existing = has(attr);

        if (!existing || !emit('remove', existing.item)) {
            return;
        }

        _items.splice(existing.index, 1);

        return resolve(
            _storage ?_storage.remove(existing.item, cart) : null
        ).then(emit.bind(cart, 'removed', existing.item), function(e) {
            emit('removefailed', e, existing.item);
            return reject(e);
        });
    }

    function clear() {
        if (!emit('clear')) {
            return;
        }

        _items.length = 0;

        return resolve(
            _storage ? _storage.clear() : null
        ).then(emit.bind(cart, 'cleared'), function(e) {
            emit('clearfailed', e);
            return reject(e);
        });
    }

    return cart;
}

createCart.option = property.bind(createCart, _defaultOptions);

module.exports = createCart;