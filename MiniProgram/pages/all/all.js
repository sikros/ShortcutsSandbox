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

function load(self, cat, num, offset,init=false) {
  var that = self;  
  wx.showLoading({
    title: 'Loading',
    mask: true
  })
  wx.request({
    url: app.globalData.gateway + 'all',
    method: 'GET',
    data: {
      "cat": cat,
      "num": num,
      "offset": offset
    },
    success: function (res) {
      if (res.data.code == 0) {
        var showitem = shuffle(res.data.data)
        var category = res.data.category
        if (init){
          that.setData({
            'showitem':[],
            'offset':0,
            'CatList': ['全部'].concat(category),
          })
        }
        that.setData({
          showitem: that.data.showitem.concat(showitem),
          showList: true,
          offset: that.data.offset+num
        })
      }else{
        wx.showToast({
          title: res.data.msg,
          icon:'error'
        })
      }
    },
    fail: function (res) {
      console.log(res)
    },
    complete:function(res){
      wx.hideLoading();
    }
  })
}

Page({
  data: {
    TabCur: 0,
    bgAlpha:0,
    scrollLeft: 0,
    CatList: ["全部"],
    CurType: "全部",
    offset:0,
    showitem: [],
    shownum:30,
    showList: false
  },

  onLoad: function () {    
    load(this, this.data.CurType, this.data.shownum,this.data.offset,true)
  },

  onPageScroll: function (t) {
    var that = this;
    that.setData({
      bgAlpha:t.scrollTop/100
    })},
  tabSelect(e) {
    var that = this;
    that.setData({
      showitem: [],
      showList: true,
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      CurType: e.currentTarget.dataset.type,
      offset:0
    })
    load(this, this.data.CurType, this.data.shownum,this.data.offset)
  },

  onPullDownRefresh() {
    getCurrentPages()[getCurrentPages().length - 1].onLoad()
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    var that = this;
    var p = that.data.p + 1
    load(this, this.data.CurType, this.data.shownum,this.data.offset)
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
  }

})