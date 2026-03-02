const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for entities.json resolution in markdown-it
config.resolver.sourceExts.push('json');

module.exports = withNativeWind(config, { input: "./global.css" });
