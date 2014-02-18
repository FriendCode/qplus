// Requires
var Q = require('q');

// Retry a function a maximum of N times
// the function must use promises and will always be executed once
function retry(fn, N, retryTimeout, canContinue) {
    if(typeof N === "function" && retryTimeout === canContinue === undefined) {
        canContinue = N;
        N = retryTimeout = undefined;
    }
    else if(typeof retryTimeout === "function") {
        canContinue = retryTimeout;
        retryTimeout = undefined;
    }
    // Default args
    N = ((N === undefined || N < 0) ? 0 : N - 1);
    retryTimeout = (retryTimeout === undefined ? 0 : retryTimeout);
    canContinue = (canContinue === undefined) ?
        function() { return true; } :
        canContinue;


    return function wrapper() {
        // Actual arguments (passed first time)
        var args = arguments;
        var d = Q.defer();

        // Our failure counter (decounter by decrementing)
        var remainingTries = N;

        // Create function without args
        // that calls fn with args
        // this makes it easier to wrap
        var f = function () {
            return fn.apply(null, args);
        };

        // The function with the try logic
        var _try = function _try() {
            // Call function

            Q.invoke(f)
            .then(function(result) {
                // Success
                d.resolve(result);
            }, function(err) {
                // Failure

                // Decrement
                remainingTries -= 1;

                // No tries left, so reject promise with last error
                if(remainingTries >= 0 && canContinue(err, N - remainingTries)) {
                    // We have some retries left, so retryTimeout
                    if(retryTimeout) {
                        setTimeout(_try, retryTimeout);
                    } else {
                        _try();
                    }
                } else {
                    // Total failure
                    d.reject(err);
                    return;
                }
            }).done();
        };

        // Start trying
        _try();

        // Give promise
        return d.promise;
    };
}

function series(funcs) {
    return funcs.reduce(Q.when, Q());
}

// Exports
exports.retry = retry;
exports.series = series;
