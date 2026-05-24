const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Metro to transpile these packages through Babel.
// By default node_modules are excluded from transpilation, which causes
// SyntaxErrors in Hermes when packages use modern JS (private fields, etc.)
config.transformer.transformIgnorePatterns = [
  "node_modules/(?!(" +
    "react-native|" +
    "@react-native|" +
    "react-native-reanimated|" +
    "react-native-gesture-handler|" +
    "react-native-screens|" +
    "react-native-svg|" +
    "expo|" +
    "@expo|" +
    "@react-navigation" +
    ")/)",
];

module.exports = config;
