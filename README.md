# Electrode Confippet

App Config processor to allow you to use templates in your config values.

Electrode Application is configuration based.  To give you some flexibility in your configs, this module enable you to use templates in your config string values.

## Install

```
npm install @walmart/electrode-confippet --save
```

## Usage

```js
const Confippet = require("@walmart/electrode-confippet");
const config = require("config");
require("@walmart/electrode-server")(Confippet.processConfig(config));
```

## Example Config

```js
{
  x: "{{config.y}}",
  n0: "{{argv.0}}",
  n1: "{{argv.1}}",
  y: "{{config.testFile}}",
  p: "{{process.cwd}}",
  testFile: "{{process.cwd}}/test/data-{{env.NODE_APP_INSTANCE}}.txt",
  acwd: "{{cwd}}",
  now: "{{now}}",
  bad: "{{bad}}",
  badConf: "{{config.bad1.bad2}}",
  badN1: {
    badN2: {
      badN3: "{{config.badx.bady}}"
    }
  },
  ui: {
    env: "{{env.NODE_ENV}}"
  }
}
```

After confippet processing, this could become something similar to the following one:

```js
{
  "x": "/Users/xchen11/dev/electrode-confippet/test/data-5.txt",
  "n0": "/usr/local/nvm/versions/node/v4.2.4/bin/node",
  "n1": "/Users/xchen11/dev/electrode-confippet/node_modules/mocha/bin/_mocha",
  "y": "/Users/xchen11/dev/electrode-confippet/test/data-5.txt",
  "p": "/Users/xchen11/dev/electrode-confippet",
  "testFile": "/Users/xchen11/dev/electrode-confippet/test/data-5.txt",
  "acwd": "/Users/xchen11/dev/electrode-confippet",
  "now": "1454105798037",
  "bad": "",
  "badConf": "",
  "badN1": {
    "badN2": {
      "badN3": ""
    }
  },
  "ui": {
    "env": "development"
  }
}
```

And you get back an array of missing values from confippet:

```js
[
  {
    "path": "config.bad",
    "value": "{{bad}}",
    "tmpl": "bad"
  },
  {
    "path": "config.badConf",
    "value": "{{config.bad1.bad2}}",
    "tmpl": "config.bad1.bad2"
  },
  {
    "path": "config.badN1.badN2.badN3",
    "value": "{{config.badx.bady}}",
    "tmpl": "config.badx.bady"
  }
]
```

## The Template

The template is in the form of `{{ref1:-some text:ref2:refN}}`.

  * Each `ref` is used as a path to retrieve a value from the context.

  * If `ref` starts with `-` then it's used as a literal string.
  
  * If the first `ref` (`ref1`) resolves to a function, then the remaining `ref`s are treated as literal strings and passed as params in an array to the function.  See [Function Ref](#function-ref).

> While you can have multiple `ref`s in a single `{{}}`, the recommended form for multiple `ref`s however is `{{ref1}}some text{{ref2}}{{refN}}`

&nbsp;
> Please note that the template processing is just using the straight string replace.  It's very simple and dumb.  It will run multiple passes to do the replacement, but nothing fancy.

## Context

The context contains these object you can use:

  - `config` - refer back to your own config.  ie: `{{config.someConfig.config1}}`
  - `process` - refer to Node global `process`
  - `argv` - refer to Node `process.argv`.  ie: `{{argv.0}}`
  - `cwd` - refer to Node `process.cwd`. ie: `{{cwd}}`
  - `env` - refer to Node `process.env`. ie: `{{env.NODE_ENV}}`
  - `now` - refer to `Date.now`. ie: `{{now}}`
  - `readFile` - function to read a file.  Usage is `{{readFile:filename:encoding}}`.  ie: `{{readFile:data/foo.txt:utf8}}`

## Function Ref

If the first `ref` in a template resolves to a function, then it will be called with an object containing the following parameters, with the remaining `ref`s stored in `params`.

`{ context, config, obj, key, value, tmpl, params, depthPath }`

Where:

  - `context` - the context
  - `config` - the config
  - `obj` - current sub object in config being processed, could be `config` itself
  - `key` - current key in `obj` being processed
  - `value` - value for `key`
  - `tmpl` - template extracted from the config value
  - `params` - the remaining `:` separated `ref`s as an array.
  - `depthPath` - current depth path in config.  ie: `config.sub1.sub2`

For example:

This template:

```
{{readFile:data/foo.txt:utf8}}
```

Will trigger this function call:

```js
context.readFile({ 
  context, config, obj, key, value, tmpl,
  params: [ "data/foo.txt", "utf8" ], depthPath 
});
```

## APIs

### [processConfig](#processconfig)

`processConfig(config, options)`

Process your config.

#### Parameters

  - `config` - your config to be processed
  - `options` - options
    - `options.context` - additional context you want to add.

For example, you can pass in the following options.

```js
{
  context: {
    test: (data) => "test",
    custom: {
      url: "http://test"
    }
  }
}
```

With that, you can refer to them in your config like this:

```js
{
  test: "{{test}}",
  url: "{{custom.url}}"
}
```

#### Returns 

An array of config items for which its template resolved to `undefined`.  An empty array `[]` is returned if everything resolved.

ie: 

```js
[ 
  { 
    path: "config.badConf.badKey", 
    value: "{{config.nonExistingConfig}}",
    tmpl: "config.nonExistingConfig" 
  } 
]
```


