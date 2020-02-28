module.exports = {
  transpileDependencies: ["vuetify"],
  chainWebpack: config => {
    config.output.globalObject("this");
  }
};
