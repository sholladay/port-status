//
// Port Status allows you to run code depending on whether
// or not it would be able to bind to / listen on a port.
//

'use strict';

var code = {
        'EACCES'     : 'denied',
        'EADDRINUSE' : 'busy'
    },
    key;


// function isHostname(input) {

//     // This function is designed to return true if given
//     // a plausible hostname, where the TLD is optional.

//     var pattern, result = false;

//     if (typeof input === 'function') {
//         input = input();
//     }
//     if (typeof input === 'string') {
//         // TLD is optional, 'localhost' will match.
//         pattern = /(?=^.{1,253}$)(^(((?!-)[a-zA-Z0-9-]{1,62}[a-zA-Z0-9])|((?!-)[a-zA-Z0-9-]{1,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,62})$)/;
//         result = pattern.test(input);
//     }

//     return result;
// }

function isIpv6(input) {

    // This function is designed to return true if given
    // a plausible IPv6 address.

    var pattern, result = false;

    if (typeof input === 'function') {
        input = input();
    }
    if (typeof input === 'string') {
        // Solution from David Syzdek. Covers compressed, embedded, mapped, and translated addresses.
        // Source: http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
        // Test cases: https://gist.github.com/syzdek/6086792
        pattern = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
        result = pattern.test(input);
    }

    return result;
}

function isIpv4(input) {

    // This function is designed to return true if given
    // a plausible IPv4 address.

    var pattern, result = false;

    if (typeof input === 'function') {
        input = input();
    }
    if (typeof input === 'string') {
        pattern = /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
        result = pattern.test(input);
    }

    return result;
}

function getIpType(input) {

    // This function is designed to return the protocol version
    // of a given IP address.

    var result = '';

    if (isIpv6(input)) {
        result = 'IPv6';
    }
    else if (isIpv4(input)) {
        result = 'IPv4';
    }

    return result;
}

function getPortStatus(port, hostname, callback) {

    var sentResult = false,  // have we called the user's callback yet?
        listenArgs = [],     // what will we say to server.listen()?
        server,
        // Default metadata about the relevant port for this status check,
        // will be overridden by server.address() (see Node docs)
        // if the server is able to start listening.
        info = {
            port    : port,
            address : hostname,
            family  : getIpType(port)
        };

    function callbackWrapper(err) {

        // This function is designed to call the user-provided callback
        // exactly once and ensure that it receives useful data.

        var status = 'ok';

        if (err) {
            // Lookup the plain english version of the error code.
            if (Object.prototype.hasOwnProperty.call(code, err.code)) {
                status = code[err.code];
            }
            // There was an error, but we don't recognize it.
            else {
                status = 'unknown';
            }
        }
        if (!sentResult) {
            callback.call(app, status, info);
            sentResult = true;
        }
    }

    function onError(err) {

        // This function will be run anytime the server encounters an error,
        // such as when the user tries to bind to port 80 on OS X without
        // running as sudo, where err.code is 'EACCES' (access denied).

        callbackWrapper(err);
    }

    function onClose(err) {

        // This function will be run after the server attempts to shutdown
        // and stop listening on the port and hostname it started on.

        callbackWrapper(err);
    }

    function onListening() {

        // This function will be run when the server was able to successfully
        // start listening on the port and hostname provided by the user.

        var key, newInfo = server.address();

        for (key in newInfo) {
            if (Object.prototype.hasOwnProperty.call(newInfo, key)) {
                info[key] = newInfo[key];
            }
        }
        server.close(onClose);
    }

    // Create the precise argument list we want to give to server.listen().
    if (port || port === 0) {
        listenArgs.push(port);
    }
    if (hostname) {
        listenArgs.push(hostname);
    }
    listenArgs.push(onListening);

    // Start the server, as a means to check port status.
    server = require('net').createServer();
    server.on('error', onError);
    server.listen.apply(server, listenArgs);
}

function isHostnameOrIp(input) {

    // This function is designed to return true if given a plausible
    // hostname or IPv4 or IPv6 address.

    var pattern, result = false;

    if (typeof input === 'string') {
        // Ridiculous solution from Mikulas Dite. Covers IPv4, IPv6, and hostnames with optional TLDs.
        // Source: http://stackoverflow.com/questions/9208814/validate-ipv4-ipv6-and-hostname
        // Test cases: http://jsfiddle.net/AJEzQ/
        pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
        result = pattern.test(input);
    }

    return result;
}

function app() {

    var i = arguments.length,
        callbackIndex,
        callback,  // code to run after we determine port status
        hostname,  // hostname / IP address to attempt listening on
        portInt,
        port;      // port to check the status of

    // Find the last function given to us, to receive port status.
    while (i--) {
        if (!callback && typeof arguments[i] === 'function') {
            callbackIndex = i;
            callback = arguments[i];
            break;
        }
    }
    // Ensure something is there to receive port status. Otherwise, checking is pointless.
    if (typeof callback !== 'function') {
        throw new Error(
            'A callback must be provided to receive port status.'
        );
    }
    // The callback must not be first, otherwise we know there's no port number before it.
    else if (callbackIndex > 0) {
        while (i--) {
            // Find the optional hostname argument.
            if (!hostname && isHostnameOrIp(arguments[i])) {
                hostname = arguments[i];
            }
            else if (typeof port !== 'number') {
                portInt = parseInt((typeof arguments[i] === 'function') ? arguments[i]() : arguments[i], 10);
                if (!Number.isNaN(portInt)) {
                    port = portInt;
                }
            }
            else {
                break;
            }
        }
    }

    if (!port && port !== 0) {
        throw new Error(
            'A port number must be provided to check port status.'
        );
    }

    getPortStatus(port, hostname, callback);
}

function getCallbackForStatus(inputStatus, cb) {

    // This function is designed to return a wrapped version
    // of a given callback, which will run conditonally,
    // based on port status.

    function callbackStatusWrapper(status) {

        // This function is designed to be directly used as the callback
        // to getPortStatus(). It will then call the user's callback,
        // if the conditions are met.

        if (status === inputStatus) {
            cb.apply(app, arguments);
        }
    }

    return callbackStatusWrapper;
}

function makeIfMethod(status) {

    // This function is designed to provide functions which are sensitive
    // to a specific port status and which wrap the callbacks you give to
    // them so they run conditionally.

    return function () {

        // This function is designed to call a provided callback
        // only when a port has a specific status.

        var args = Array.prototype.slice.call(arguments),
            i = args.length;

        while (i--) {
            if (typeof args[i] === 'function') {
                args[i] = getCallbackForStatus(status, args[i]);
                break;
            }
        }
        app.apply(app, args);
    };
}

// Make convenience methods like ifBusy() for error cases.
for (key in code) {
    if (Object.prototype.hasOwnProperty.call(code, key)) {
        app['if' + code[key].charAt(0).toUpperCase() + code[key].substring(1)] = makeIfMethod(code[key]);
    }
}
// Make convenience methods for non-error cases.
app.ifOk = makeIfMethod('ok');

// Expose the error codes we recognize and the status they map to.
app.code = code;

module.exports = app;
