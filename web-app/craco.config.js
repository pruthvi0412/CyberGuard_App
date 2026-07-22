module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress source map warnings from third-party packages (e.g. @mediapipe)
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
      ];
      return webpackConfig;
    },
  },
};
