const merge = require('webpack-merge');
import baseConfig from './webpack.config.base';

module.exports = merge(baseConfig, {
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/': 'http://localhost:5000',
    },
    historyApiFallback: true,
    disableHostCheck: true,
  },
});
