# Clock Storm

A companion tool to ensure that you save and submit your timecard.

[![Security Scans](https://github.com/clockstorm/clockstorm/actions/workflows/security-scans.yml/badge.svg)](https://github.com/clockstorm/clockstorm/actions/workflows/security-scans.yml)

# Local Development

## Requirements

Node >= v18

## Extension Setup

```bash
$ git clone https://github.com/clockstorm/clockstorm.git
$ cd clockstorm/extension
$ npm install
$ npm run build
```

Then simply load the `dist` directory as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

## Testing

The extension uses [Jest](https://jestjs.io/) for its test suite.

```bash
$ cd clockstorm/extension
$ npm run test
```

# License

Clock Storm is licensed under the [MIT license](./LICENSE.md)
