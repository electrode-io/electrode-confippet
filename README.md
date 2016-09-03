# Electrode Confippet

Confippet is a versatile utility for managing your NodeJS application configuration.  Its goal is customization and extensibility, but offers a preset config out of the box.  

If the preset config doesn't meet your needs, you can customize and extend it.
 
If you don't want to use the preset config, you can use Confippet's features to create your own.

These are the features available to you:

  * `presetConfig` - Automatically load a preset config object with some default settings.
  * [composeConfig] - Allows you to compose your configuration from multiple sources.
  * [processConfig] - Allows you to use templates in your configuration.
  * [store] - A simple convenient config store to help you access your config.

## Install

```
npm install electrode-confippet --save
```

## Quickstart Guide

### Electrode
- Confippet is built-in to electrode. Scaffold an electrode app using the following commands: 
```
npm install -g yo
npm install -g generator-electrode
yo electrode
```
- Once the scaffolding is complete, open the following config files: 
```
config
|_ default.json
|_ development.json
|_ production.json
```
- Update and/or add your configuration settings 
- Start server: 
```
export NODE_ENV=production
gulp hot
```

### Express
- Scaffold an express app: 
```
npm install express-generator -g
express myApp
cd myApp 
npm install 
```
- Add electrode-confippet: 
```
npm install electrode-confippet --save
```
- Create the config folder: 
```
mkdir config
cd config
```
- Add the following config files: 
```
config
|_ default.json
|_ development.json
|_ staging.json
|_ production.json
```
- Add your configuration settings 
- Example development.json: 
```
{
  "settings: {
    url: "http://dev.mysite.com"
  }
}
```
- Add the following to app.js: 
```
const config = require("electrode-confippet").config;
const url = config.settings.url;
```
- Start server: 
```
export NODE_ENV=development
npm start
```

## Using the Auto Loaded Preset Config

Confippet uses `presetConfig` to automatically compose a preset config with some default settings similar to that of the [node-config module].

Typically the preset config is enough to handle an application's configuration management.

If you are not interested in customizing it, then you can just use the preset config without much work.

```js
const config = require("electrode-confippet").config;
const url = config.$("settings.url");
```

> The auto load only occur when you access `Confippet.config` the first time.

## Default Config Files Settings

By default, `Confippet.config` will be composed by automatically searching and loading these files under the `config` directory in the order specified:

> This is the same as [node-config files].

   1. `default.EXT`
   1. `default-{instance}.EXT`
   1. `{deployment}.EXT`
   1. `{deployment}-{instance}.EXT`
   1. `{short_hostname}.EXT`
   1. `{short_hostname}-{instance}.EXT`
   1. `{short_hostname}-{deployment}.EXT`
   1. `{short_hostname}-{deployment}-{instance}.EXT`
   1. `{full_hostname}.EXT`
   1. `{full_hostname}-{instance}.EXT`
   1. `{full_hostname}-{deployment}.EXT`
   1. `{full_hostname}-{deployment}-{instance}.EXT`
   1. `local.EXT`
   1. `local-{instance}.EXT`
   1. `local-{deployment}.EXT`
   1. `local-{deployment}-{instance}.EXT`

**Where**

  * `EXT` can be any of `["json", "yaml", "js"]`.  Confippet will load all of them in that order.
  * `{instance}` is your app's instance string in multi-instance deployments.  Specified by `NODE_APP_INSTANCE`. 
  * `{short_hostname}` is your server name up to the first dot.
  * `{full_hostname}` is your whole server name.
  * `{deployment}` is your deployment environment.  Specified by `NODE_ENV`.

> After it search and load all the files, it will look for override JSON strings from environment variables.

## Environment Variables

The preset config is composed with settings from the following environment variables.

  * `AUTO_LOAD_CONFIG_OFF` - If this is set, then Confippet will **not** automatically load any configuration into the preset `config` store.  So `Confippet.config` is just an empty store.  You can set this and customize the config structure before loading.

  * `NODE_CONFIG_DIR` - Set the directory to search for config files.  By default, Confippet looks in the `config` directory for config files.
  
  * `NODE_ENV` - By default, Confippet load `development` config files after loading `default`.  You can set this to change to a different deployment such as `production`.
  
  * `NODE_APP_INSTANCE` - If you have a multi-instances deployment app, you can set this to load instance specific configurations.
  
  * `AUTO_LOAD_CONFIG_PROCESS_OFF` - By default, after composing the config from all sources, Confippet will use [processConfig] to process the templates.  You can set this to some value to turn it off.
  
  * `NODE_CONFIG` - You can set this to a valid JSON string and Confippet will parse it to override the configuration.
  
  * `CONFIPPET*` - You can set any environment variable that starts with `CONFIPPET` and Confippet will parse them as JSON strings to override the configuration.

## Using Templates

In your config files, you can have templates in the config values.  The templates will be resolved with a preset context.

See [processConfig] for more information on config value templates.

## Config Composition

Any config source loaded will be merged into the config store.  So anything that's loaded first can be override by something that's loaded later.

Objects `{}` are merged together.

Primitive values (string, boolean, number) are replaced.

***Arrays are replaced.***

***EXCEPT*** if the key starts with `+` and both source and target are arrays, then they are union together using lodash _.union.

## File Types

Confippet supports `json`, `yaml`, and `js` files.  It will search in that order.  Each one found will be loaded and merged into the config store.  So `js` overrides `yaml` overrides `json`.

You can add handlers for different file types and change their loading order.  See [composeConfig] for further details.

## Usage in Node Modules

If you have a Node module that has its own configurations base on environment, like `NODE_ENV`, you can use Confippet to load config files for your module.

The example below will use the [default compose options](./lib/default-compose-opts.js) to compose configurations from the directory `config` under the script's directory (`__dirname`).

```js
const Confippet = require("electrode-confippet");

const options = {
  dirs: [Path.join(__dirname, "config")],
  warnMissing: false,
  context: {
    deployment: process.env.NODE_ENV
  }
};

const defaults = Confippet.store();
defaults._$.compose(configOptions);
```

## Quick Intro to Customizing

The [composeConfig] feature supports a fully customizable and extendable config structure.  Even the preset config structure can be extended since it's composed using the same feature.

If you want to use the preset config, but add an extension handler or insert a source, you can turn off auto loading, and load it yourself with your own options.

> NOTE this has to happen before any other file tries to access `Confippet.config`.  You should do this in your startup `index.js` file.

For example:

```js
process.env.AUTO_LOAD_CONFIG_OFF = true;

const JSON5 = require("json5");
const fs = require("fs");
const Confippet = require("electrode-confippet");
const config = Confippet.config;

const extHandlers = Confippet.extHandlers;
extHandlers.json5 = (fullF) => JSON5.parse(fs.readFileSync(fullF, "utf8"));

Confippet.presetConfig.load(config, {
  extSearch: ["json", "json5", "yaml", "js"],
  extHandlers,
  providers: {
    customConfig: {
      name: "{{env.CUSTOM_CONFIG_SOURCE}}",
      order: 300,
      type: Confippet.providerTypes.required
    }
  }
});
```

The above compose option adds a new provider that looks for a file named by the env var `CUSTOM_CONFIG_SOURCE` and will be loaded after all default sources are loaded (controlled by the order).

It also adds a new extension handler for `json5`, and have it loaded after `json`.

To further understand the `_$` and the `compose` options.  Please see [store], [composeConfig], and [processConfig] features for details.

[node-config module]: https://github.com/lorenwest/node-config
[node-config files]: https://github.com/lorenwest/node-config/wiki/Configuration-Files
[store]: ./store.md
[composeConfig]: ./compose.md
[processConfig]: ./templates.md
