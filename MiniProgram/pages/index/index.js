const app = getApp()

function shuffle(array) {
  var n = array.length, t, i;
  while (n) {
    i = Math.random() * n-- | 0; // 0 ≤ i < n
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }
  return array;
}

function reload(params) {
  var that = params;
  wx.showLoading({
    title: 'Loading',
    mask: true
  })
  wx.request({
    url: app.globalData.gateway+'index',
    dataType:'json',
    success: function (res) {
      wx.setStorage({
        key: 'shortcuts',
        data: res.data.shortcuts
      });
      wx.setStorage({
        key: 'num',
        data: res.data.num
      });
      wx.setStorage({
        key: 'category',
        data: res.data.category
      });
      wx.setStorage({
        key: 'swiperList',
        data: res.data.banner
      });
      wx.setStorage({
        data: new Date().getTime(),
        key: 'update',
      });
      var shortcuts = res.data.shortcuts
      var showitem = shuffle(shortcuts.slice(0, 10))
      var swiperList = res.data.banner
      that.setData({
        shortcuts: shortcuts,
        showitem: showitem,
        showSwiper: true,
        swiperList: swiperList,
        showList: true,
      })
    },
    fail: function (res) {
      console.log(res)
    }
  })
  wx.hideLoading();
}

Page({
  data: {
    cardCur: 0,
    bgAlpha:0,
    showSwiper: false,
    showList: false,
    scrollTop:0,
    swiperList: [],
    showitem: [],
    n: 10,

  },

  onLoad: function () {
    var that = this;
    var size = wx.getStorageInfoSync('shortcuts')['currentSize'];
    var uptime = wx.getStorageSync('update');
    var timepassd = new Date().getTime() - uptime
    if (size < 2 || timepassd > 60 * 60 * 24 * 1000) {
      reload(this)
    } else {
      var n = that.data.n
      var swiperList = wx.getStorageSync('swiperList');
      var shortcuts = wx.getStorageSync('shortcuts');
      var showitem = shuffle(shortcuts.slice(0, n))
      that.setData({
        swiperList: swiperList,
        showitem: showitem,
        showSwiper: true,
        showList: true,
      })
      this.towerSwiper('swiperList');
    }
  },
  onPageScroll: function (t) {
    var that = this;
    that.setData({
      bgAlpha:t.scrollTop/200
    })},

  onPullDownRefresh() {
    reload(this)
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    var that = this;
    var p = that.data.n
    var n = p + 10;
    var shortcuts = wx.getStorageSync('shortcuts');
    var showitem = shuffle(shortcuts.slice(p, n))
    that.setData({
      "n": n,
      "showitem": that.data.showitem.concat(showitem),
    })
  },
  
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    }
  },
  jumpPage: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  onShareAppMessage() {
    return {
      title: '捷径沙盒-优质快捷指令脚本库',
      imageUrl: '/images/share.jpg',
      path: '/pages/index/index'
    }
  },
})