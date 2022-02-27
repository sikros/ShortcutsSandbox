App({
  globalData: {
    gateway : 'https://www.xcjkwl.com/', //后台服务域名地址以/结束
    msgtmplid: '', //模板消息id
    },
  onLaunch: function () {
    var that = this;
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
  }
})