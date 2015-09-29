# port-status

Run code depending on whether it could bind to a port.

## Installation
````sh
npm install port-status --save
````

## Usage

Get it into your program.
````javascript
var portStatus = require('port-status');
````

Get a promise for the status of a port, as a lowercase string.
````javascript
// On OS X without sudo, this will log 'Status: denied'.
// If you use sudo and it is free, then 'Status: ok'.
portStatus(
    80,           // port you want to check
    '127.0.0.1',  // optional hostname to try to bind on
)
.then(
    function (status) {
        console.log('Status:', status);
    }
)
````

Port status passes all arguments to Node's [net.Server#listen()](https://nodejs.org/api/net.html#net_server_listen_options_callback), so you can also use an object, for example.
````javascript
portStatus(
    {
        port     : 80,
        hostname : '127.0.0.1',
    }
)
.then(
    function (status) {
        console.log('Status:', status);
    }
)
````

Make your .then() handler conditional, by using convenience methods that reject
their promises if the port status is not exactly what you want.
````javascript
// This will only log something if the port is already in use. Otherwise, the
// promise will reject, and you could use .catch() to print something.
portStatus(
    80,
    '127.0.0.1',
)
.ifBusy()
.then(
    function (status) {
        console.log('Status:', status);
    }
)
````

## Contributing
See our [contribution guidelines](https://github.com/sholladay/port-status/blob/master/CONTRIBUTING.md "The guidelines for being involved in this project.") for mode details.
1. [Fork it](https://github.com/sholladay/port-status/fork).
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/port-status/compare "Submit code to this repo now for review.").

## License
[MPL-2.0](https://github.com/sholladay/port-status/blob/master/LICENSE "The license for port-status.")

Go make something, dang it.
