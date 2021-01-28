import store from "./store";
import presetConfig from "./preset-config";

const config = store();

export = (composeOptions, defaults) => {

    config._$.defaults(defaults);
    config._$.compose(composeOptions);

    return config;
};
