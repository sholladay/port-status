//
// Port Status allows you to run code depending on whether
// or not it would be able to bind to / listen on a port.
//

'use strict';

var net = require('net'),
    // Mapping of error codes we receive when a port cannot be used
    // to the results we deliver to our users.
    status = {
        'EACCES'     : 'denied',
        'EADDRINUSE' : 'busy'
    },
    key;

function portStatus() {

    var args = Array.prototype.slice.call(arguments),
        server = net.createServer();

    function startServer(resolve, reject) {

        function onError(err) {

            var meaning = status[err.code];

            // Is it an error we recognize? If so, we now know the
            // port status and that is what we are here for, so it
            // is not an error by our definition.
            if (meaning) {
                resolve(meaning);
            }
            else {
                reject(err);
            }
        }

        function onClose(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve('ok');
            }
        }

        function onListening() {
            server.close(onClose);
        }

        args.push(onListening);

        server.once('error', onError);
        server.listen.apply(server, args);
    }

    return new Promise(startServer);
}

// Create functions that check port status, but reject their promises if the
// determined port status is not the same as what they expect. Thus enabling
// conditional .then() handlers to be used.
function makeIfMethod(expectedStatus) {

    return function () {

        var args = Array.prototype.slice.call(arguments);

        // Promise a specific port status.
        return portStatus.apply(portStatus, args)
            .then(
                function (status) {
                    if (status !== expectedStatus) {
                        throw new Error(
                            'Port status \"' + status +
                            '\", not \"' + expectedStatus + '\"'
                        );
                    }

                    // The status must be as we expect, so pass it along.
                    return status;
                }
            );
    };
}

// Make convenience methods like ifBusy() for error cases.
for (key in status) {
    if (Object.prototype.hasOwnProperty.call(status, key)) {
        portStatus['if' + status[key][0].toUpperCase() + status[key].substring(1)] = makeIfMethod(status[key]);
    }
}
// Make convenience methods for non-error cases.
portStatus.ifOk = makeIfMethod('ok');

// Expose the error codes we recognize and the status they map to.
portStatus.status = status;

module.exports = portStatus;
