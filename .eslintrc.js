module.exports = {
  extends: ["eslint:recommended", "universe/native"],

  overrides: [
    {
      "no-trailing-spaces": "error",
      files: ["*.ts", "*.tsx", "*.d.ts"],

      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "react/prop-types": "off",
      },
    },
  ],

  plugins: ["react-hooks"],

  rules: {
    "import/order": "off",
  },

  env: {
    node: true,
  },
};
