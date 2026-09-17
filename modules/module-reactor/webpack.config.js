module.exports = (config) => {
  // Jimp 1.6.1 ships an empty browser entry. Resolve its working package entry
  // while keeping browser resolution enabled for its dependencies.
  config.resolve.alias = {
    ...config.resolve.alias,
    jimp$: require.resolve('jimp')
  };
  return config;
};
