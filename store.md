# Config Store

Confippet's config is store in an object that contains two special hidden properties `$` and `_$`.

Example to create a new store:

```js
const Confippet = require("electrode-confippet");

const store = Confippet.store(); // creates a new store
```

The preset config is a store object:

```js
const config = require("electrode-confippet").config;

const url = config.$("service.url");
```

## `$`

`$` is a function that allows you to retrieve config with a string or array path.

For example, instead of doing:

```js
const url = config.service && config.service.url;
```

You can do:

```js
const url = config.$("service.url");
```

## `_$`

`_$` is an object with these methods.

### `_$.use(data)`

Directly override existing config with `data`.

Example:

```js
config._$.use({ url: "http://localhost"});
```

Will change `config.url` to `http://localhost`.

### `_$.defaults(data)`

Directly use `data` as defaults for the config.

Example:

```js
config._$.defaults({ url: "http://localhost" });
```

Will set `config.url` to `http://localhost` if it's `undefined`.

### `_$.compose(info)`

Load and add config using [composeConfig].

Example:

```js
config._$.compose(composeOptions);
```

### `_$.reset()`

Set config to `{}`

[composeConfig]: ./compose.md
