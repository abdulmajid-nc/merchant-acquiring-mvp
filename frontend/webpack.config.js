// webpack.config.js
module.exports = {
  // Add this to ignore specific source map warnings
  ignoreWarnings: [
    {
      module: /node_modules\/react-datepicker/,
      message: /Failed to parse source map/,
    },
  ],
};
