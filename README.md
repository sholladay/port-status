# port-status [![Build status for port-status on Circle CI.](https://img.shields.io/circleci/project/sholladay/port-status/master.svg "Circle Build Status")](https://circleci.com/gh/sholladay/port-status "Port Status Builds")

> Detect port availability.

## Why?

 - Fail fast.
 - Sanitize user configuration.
 - Check if a server started successfully.

## Install

```sh
npm install port-status --save
```

## Usage

Get it into your program.

```js
const portStatus = require('port-status');
```

Get a promise for the status of a port, as a lowercase string.

```js
// On OS X without sudo, this will log 'Status: denied'.
// If you use sudo and it is free, then 'Status: ok'.
portStatus(
    80,           // port you want to check
    '127.0.0.1'   // optional hostname to try to bind on
)
.then((status) => {
    console.log('Status:', status);
});
```

Port status passes all arguments to Node's [net.Server#listen()](https://nodejs.org/api/net.html#net_server_listen_options_callback), so you can also use an object, for example.

```js
portStatus({
    port     : 80,
    hostname : '127.0.0.1'
})
.then((status) => {
    console.log('Status:', status);
});
```

Make your .then() handler conditional, by using convenience methods that reject
their promises if the port status is not exactly what you want.

```js
// This will only log something if the port is already in use. Otherwise, the
// promise will reject, and you could use .catch() to print something.
portStatus.ifBusy(
    80,
    '127.0.0.1'
)
.then((status) => {
    console.log('Status:', status);
})
```

## Contributing

See our [contributing guidelines](https://github.com/sholladay/port-status/blob/master/CONTRIBUTING.md "The guidelines for participating in this project.") for more details.

1. [Fork it](https://github.com/sholladay/port-status/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/port-status/compare "Submit code to this project for review.").

## License

[MPL-2.0](https://github.com/sholladay/port-status/blob/master/LICENSE "The license for port-status.") © [Seth Holladay](http://seth-holladay.com "Author of port-status.")

Go make something, dang it.
