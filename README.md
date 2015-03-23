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

Retrieve the status of a port, asynchronously, as a lowercase string.

````javascript
function portCheck(status) {
    console.log('Status:', status);
}
// On OS X without sudo, this will print 'Status: denied'.
portStatus(
    80,           // port you want to check
    '127.0.0.1',  // optional hostname to try to bind on
    portCheck     // callback for us to report back to
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
