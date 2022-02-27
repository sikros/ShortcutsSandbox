Page({
  data:{
    num:wx.getStorageSync('num')
  },
  onLoad: function () {
    var that = this;
    wx.request({
      url: 'https://v1.hitokoto.cn/',
      method: 'GET',
      success: function (res) {
        that.setData({
          hitokoto: res.data.hitokoto
        })
      }
    })
  },
  onPullDownRefresh() {
    getCurrentPages()[getCurrentPages().length - 1].onLoad();
    wx.stopPullDownRefresh();
  },

  CopyText(e) {
    wx.setClipboardData({
        data: e.currentTarget.dataset.link,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              console.log(res.data) // data
            }
          })
        }
      }),
      wx.showToast({
        title: '已复制',
        icon: 'success',
        duration: 2000
      })
  },


  CopyLink(e) {
    wx.setClipboardData({
        data: e.currentTarget.dataset.link,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              console.log(res.data) // data
            }
          })
        }
      }),
      wx.showToast({
        title: '账号已复制\n微信搜一搜关注',
        icon: 'none',
        duration: 2000
      })
  },

  showQrcode(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.url]
    })
  },

  openCustomerServiceChat(e) {
    wx.openCustomerServiceChat({
      extInfo: {
        url: 'https://work.weixin.qq.com/kfid/kfc0869c9324acf64c5'
      },
      corpId: 'wwe021fad09884800a',      
    })
  },

  admin(e){
    wx.navigateTo({
      url: '/pages/admin/list',
      
    })
  }

})