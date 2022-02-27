const app = getApp();
let interstitialAd = null;
Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    url: 'Loading...',
    name: '...',
    intro: '...',
    author: '...',
    homepage: '...',
    bgAlpha: 0
  },
  onLoad: function (options) {
    var that = this;
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-d163f97069d461cb'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

    //页面初始化 options为页面跳转所带来的参数
    wx.request({
      url: app.globalData.gateway + 'shortcut',
      method: 'GET',
      data: {
        "sid": options.sid
      },
      success: function (res) {
        that.setData({
          sid: options.sid,
          url: res.data.url,
          name: res.data.name,
          intro: res.data.intro,
          author: res.data.author,
          homepage: res.data.homepage,
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  feedback(e) {
    var that=this
    wx.showModal({
      title: '举报作品',
      content: '',
      placeholderText: '请输入这个作品存在的问题',
      editable: true,
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.gateway + 'feedback',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              sid:  that.data.sid,
              name: that.data.name,
              content: res.content,
            },
            success: res => {
              wx.showToast({
                icon:'none',
                title: res.data.msg,
              })
            }
          })
        }
      }
    })
  },
  admin(e){
    wx.navigateTo({
      url: '/pages/admin/admin?sid='+this.options.sid,      
    })
  },
  showModal(e) {
    var that = this;
    that.setData({
      showvideo: true
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  CopyLink(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.link,
      success: function (res) {
        wx.showToast({
          title: '连接已复制',
          icon: 'success',
          duration: 2000
        })
      },
    })
  },

  onPageScroll: function (t) {
    var that = this;
    that.setData({
      bgAlpha:t.scrollTop/200
    })},

  onShareAppMessage() {
    return {
      title: '分享给你一个快捷指令'
    }
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  tabSelect(e) {
    console.log(e);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  }
})