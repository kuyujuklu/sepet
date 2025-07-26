module.exports = function (api) {
  api.cache(true);
  api.cache(true);
  return {
    presets: [["babel-preset-expo", {
      jsxImportSource: "nativewind"
    }], "nativewind/babel"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            assets: "./assets",
            components: "./src/components",
            modules: "./src/modules",
            lib: "./src/lib",
            types: "./src/types",
            constants: "./src/constants",
          },
        },
      ],
    ],
  };
};
