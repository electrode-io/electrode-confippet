# Compose Config

A composer that can take multiple config files and pick a subset base on environment settings and compose them into a single configuration store.

## API

### [confippet.composeConfig](#confippetcomposeconfig)

```js
const config = composeConfig(options);
```

   * `options`
   
```js
{
    dir: "config",                       // Directory containing all the config files 
    useDefaults: false,                  // If true or undefined, then include the default compose options
    extSearch: [ "json", "yaml", "js" ], // Array of extensions of config files to search, in the order given
    extHandlers: {                       // handlers to load the config file for each extension
        json: require,
        js: require,
        yaml: (filename) => YamlLoader(filename)
    },
    failMissing: true,          // If true, then fail when an expected config file is missing
    warnMissing: true,          // If true, then log warning if an expected config file is missing
    verbose: false,             // If true, then log extra messages to conolse
    providers: {                // List of config providers
        default: {
            name: "default",    // prefix of the config file name
            filter: true,       // If not undefined, must be truthy, or an array of all truthy values to enable this provider
            type: "required",   // provider type, can be required, disabled, optional, or warn
            handler: () => { }, // optional handler to load the config
            order: 0
        }
    },
    providerList: undefined,    // An array to select providers to use, if undefined then all providers will be used
    context: {                  // context for processing templates in the options itself
        deployment: "development"
    }
}
```

Where:

  - `dir` - Directory inside which to look for config files
  - `useDefaults` - Set to false to not use the default [compose config options](./lib/default-compose-opts.js)
  - `extSearch` - Array of extensions of the config files to search, in the order given.
  - `extHandlers` - Functions for each extension to handle loading of the config file
  - `failMissing` - If true, then fail when an expected config file is missing.
  - `warnMissing` - If true, then log warning message when an expected config file is missing.
  - `verbose` - If true, then log extra messages to console
  - `providers` - A list of objects specifying each config file to load from the config directory
  - `providerList` - An array to select providers to use, if undefined then all providers will be used
  - `context` - You can use templates in your `options` values and `composeConfig` will process your options with [processConfig].

Provider spec:

  - `name` - Prefix of the config file name
  - `filter` - If not undefined, must be truthy, or an array of all truthy values to enable this provider
    - This allows turn off a provider by context.  For example, `["{{instance}}"]` would turn on a provider only if `instance` is defined in context.
  - `type` - Type of provider.  Can be `required`, `disabled`, `optional`, or `warn`.  
  - `handler` - An optional handler to retrieve the config
  - `order` - A number to control the order the providers to process.  Lower values will be loaded first.  The config that loads last will override the ones loaded earlier.
  
### Usage in Preset Config

You can see how preset config use the compose config and store features.

[preset-config.js](./lib/preset-config.js)

And the compose config options for the preset-config

[default-compose-opts.js](./lib/default-compose-opts.js)

[processConfig]: ./templates.md
