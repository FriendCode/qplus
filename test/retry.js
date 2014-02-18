// Requires
var Q = require('q');

var assert = require('assert');

var retry = require('../').retry;


describe('retry', function() {
    it('should retry N times', function(done) {
        var i = 0;
        var N = 10;
        retry(function() {
            i++;
            return Q.reject('some failure');
        }, N)()
        .fail(function(err) {
            // Check that it happened N times
            assert.equal(i, N);
        })
        .done(done, done);
    });

    it('should not retry on fatal errors', function(done) {
        var i = 0;
        var limit = 5;
        var N = 10;
        retry(function() {
            return Q.reject("I'm a failure as a function");
        })()
        .fail(function(err) {
            assert.equal(i, limit);
        })
        .done(done, done);
    });

    it('should work with throwing errors', function(done) {
        var i = 0;
        var N = 7;
        retry(function() {
            i++;
            throw new Error('Failure !!!');
        }, N)()
        .fail(function(err) {
            assert.equal(i, N);
        })
        .done(done, done);
    });

    it('should work with synchronous functions', function(done) {
        var i = 0;
        var N = 3;
        retry(function() {
            if(i === 0) {
                i++;
                throw new Error('We want to fail once');
            }
            return 'Success';
        }, N)()
        .then(function() {
            // Check that if failed once
            assert.equal(i, 1);
        })
        .done(done, done);
    });
});