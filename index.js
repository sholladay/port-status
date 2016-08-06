//
// Port Status allows you to run code depending on whether
// or not it would be able to bind to / listen on a port.
//

'use strict';

const net = require('net');
// Mapping of error codes we receive when a port cannot be used
// to the results we deliver to our users.
const status = {
    EACCES     : 'denied',
    EADDRINUSE : 'busy'
};

const check = (...args) => {
    const server = net.createServer();

    return new Promise((resolve, reject) => {
        server.once('error', (err) => {
            // Is it an error we recognize? If so, we now know the
            // port status and that is what we are here for, so it
            // is not an error by our definition.
            const meaning = status[err.code];
            if (meaning) {
                resolve(meaning);
                return;
            }

            reject(err);
        });

        server.listen(...args, () => {
            server.close((err) => {
                if (err) {
                    reject(err);
                }
                resolve('ok');
            });
        });
    });
};

const portStatus = (...args) => {
    return check(...args);
};

portStatus.check = check;

// Create functions that check port status, but reject their promises if the
// determined port status is not the same as what they expect. Thus enabling
// conditional .then() handlers to be used.
const makeIfMethod = (expectedStatus) => {
    return (...args) => {
        // Promise a specific port status.
        return portStatus.check(...args)
            .then((actualStatus) => {
                if (actualStatus === expectedStatus) {
                    return actualStatus;
                }

                throw new Error(
                    `Port status "${actualStatus}", not "${expectedStatus}"`
                );
            });
    };
};

// Make convenience methods like ifBusy() for error cases.
Object.keys(status).forEach((key) => {
    portStatus['if' + status[key][0].toUpperCase() + status[key].substring(1)] = makeIfMethod(status[key]);
});

// Make convenience methods for non-error cases.
portStatus.ifOk = makeIfMethod('ok');

// Expose the error codes we recognize and the status they map to.
portStatus.status = status;

module.exports = portStatus;
