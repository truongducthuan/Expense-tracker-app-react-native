module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo wires up the worklets/reanimated transform itself as of
    // SDK 54. The old explicit "react-native-reanimated/plugin" entry no longer
    // exists in Reanimated 4 and fails the build if listed.
    presets: ["babel-preset-expo"],
  };
};
