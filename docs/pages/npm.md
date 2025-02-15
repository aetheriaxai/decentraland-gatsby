# NPM Modules

Directive and documentation about some of the most common NPM modules used in this project.

Generally, we discourage using any NPM module if there is any native alternative, but sometimes it's just not possible. In those cases, we come up with a list of guidelines to follow with you need to choose a module.

## Browser support

We support all browser included into the [`production` list of `.browserslistrc`](../../.browserslistrc#L1). Any experimental feature may be consider if it's supported by all the browsers on the [`modern` list](../../.browserslistrc#L18), but it will require a fallback for the `production` list or a graceful handle for browsers that didn't support it.

## Node support

We support all Node versions greater or equal than [`v16.17.0`](../../.nvmrc#L1).

> Note: The next version of the framework is expected to support only Node 18.8.0 or greater.

## [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

The Fetch API provides an interface for fetching resources (including across the network), it is a more powerful and flexible replacement for [XMLHttpRequest](XMLHttpRequest) and is also available in [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

It is supported by all our browser list and also support since node 18:

![fetch](../img/caniuse.com__search=fetch.png)

**We recommend using fetch instead of any other library, unless you need to support node lower than 16, in that case we recommend using [`node-fetch`](https://www.npmjs.com/package/uuid) if your code is intended to run only on node or [`cross-fetch`] if is intended to run on node and browsers.**

## [UUID](https://www.npmjs.com/package/uuid)

This module is used to generate unique identifiers according to [RFC4122](https://tools.ietf.org/html/rfc4122).

There are native alternatives for this module like [`crypto.randomUUID([options])`](https://nodejs.org/docs/latest-v16.x/api/crypto.html#cryptorandomuuidoptions) on node (since node 14) and [`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) on web but is not fully supported by all our browser list:

![fetch](../img/caniuse.com__search=randomUUID.png)

Performance wise, the native version are [considerably faster than `uuid`](https://github.com/2fd/benchmark-uuid), except for the latest version of the module (`uuid@9`)

The main disadvantage of the native version is that they don't support the `v3` and `v5` versions of the UUID, but we don't use them in our codebase.

**We recommend generating UUIDs only on servers using the native version. Use `uuid` in a version don't lower than 9 only if you need UUID in the browser or if you need UUIDs in versions other than 4**
