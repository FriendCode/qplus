// Requires
var Q = require('q');

// Retry a function a maximum of N times
// the function must use promises and will always be executed once
function retry(fn, N, retryTimeout) {
    // Default args
    N = ((N === undefined || N < 0) ? 0 : N - 1);
    retryTimeout = (retryTimeout === undefined ? 0 : retryTimeout);

    return function wrapper() {
        // Actual arguments (passed first time)
        var args = arguments;
        var d = Q.defer();

        // Our failure counter (decounter by decrementing)
        var remainingTries = N;

        // The function with the try logic
        var _try = function _try() {
            // Call function
            fn.apply(null, args)
            .then(function(result) {
                // Success
                d.resolve(result);
            }, function(err) {
                // Failure

                // Decrement
                remainingTries -= 1;

                // No tries left, so reject promise with last error
                if(remainingTries < 0) {
                    // Total failure
                    d.reject(err);
                    return;
                } else {
                    // We have some retries left, so retry
                    setTimeout(_try, retryTimeout);
                }
            }).done();
        };

        // Start trying
        _try();

        // Give promise
        return d.promise;
    };
}


// Exports
exports.retry = retry;
