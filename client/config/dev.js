
module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  mini: {
    // 解决包体积过大无法进行预览的问题
    webpackChain: (chain) => {
      chain.merge({
        plugin: [
          {
            plugin: require('terser-webpack-plugin'),
            args: [{
              terserOptions: {
                compress: true, // 默认使用terser压缩
                // mangle: false,
                keep_classnames: true, // 不改变class名称
                keep_fnames: true // 不改变函数名称
              }
            }]
          }]
      });
    },
  },
  h5: {}
};
