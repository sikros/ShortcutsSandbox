const app = getApp()

function load(self, k, p, n) {
  var that = self;  
  wx.showLoading({
    title: 'loading',
    mask: true
  })

  wx.request({
    url:  app.globalData.gateway+'search',
    method: 'GET',
    data: {
      "keyword": k,
      "offset": p,
      "num": n
    },
    success: function (res) {
      console.log(res)
      var showitem = res.data.data
      that.setData({
        showitem: that.data.showitem.concat(showitem),
        showList: true,
        p: p
      })
      wx.hideLoading();
    },
    fail: function (res) {
      console.log(res)
    }
  })
}

Page({
  data: {
    TabCur: 0,
    scrollLeft: 0,
    CatList: ["全部"],
    CurType: "全部",    
    bgAlpha:0,
    keyword: '',
    offset: 0,
    num: 30,
    showitem: [],
    showList: false,
  },

  onPageScroll: function (t) {
    var that = this;
    that.setData({
      bgAlpha:t.scrollTop/200
    })},

  onLoad: function () {

  },

  onPullDownRefresh() {
    getCurrentPages()[getCurrentPages().length - 1].onLoad()
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    var that = this;
    that.setData({
      offset:this.data.offset+this.data.num
    });
    load(this, this.data.keyword, this.data.offset, this.data.num)
  },
  //事件处理函数

  wxSearchInput: function (e) {
    var that = this;
    that.setData({
      keyword: e.detail.value
    })
  },
  wxSerchFocus: function (e) {
    var that = this;
    that.setData({
      keyword: e.detail.value,
      offset:0,
      showList: false
    })
  },

  wxSearchBlur: function (e) {
    this.setData({
      keyword: e.detail.value,
      showList: true
    })
  },
  wxSearchFn: function (e) {
    var that=this
    that.setData({
      showitem:[]
    })
    load(this, this.data.keyword, this.data.offset, this.data.num)
  },

  wxSearchRand: function (e) {
    var that=this
    that.setData({
      showitem:[]
    })
    load(this, '', 0, 6)
  },

  jumpPage: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

})