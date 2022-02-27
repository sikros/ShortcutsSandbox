const app = getApp();
Page({
  data: {        
    islogin: 0,
    isadmin: 0,
    sid: 0,
    openid:'',
    msg:'',
    list:[]
  },
  onLoad: function () {
    var that = this;    
    if (this.data.islogin == 0) {
      this.login(); 
    }
    if (this.data.list=[]){
      this.getlist();
    }    
  },
  
  onPullDownRefresh() {
    getCurrentPages()[getCurrentPages().length - 1].onLoad();
    wx.stopPullDownRefresh();
  },
  
  getlist() {
    var that = this
    wx.login({
      success(res){
        wx.request({
          url: app.globalData.gateway+'sulist',
          method: 'GET',
          data: {
            'token': res.code
          },
          success: function (res) {
            if (res.data.code==0){
              that.setData({
                'list': res.data.data,
              })
            }
          }
        })
      }
    })
  },
  login() {
    var that = this;
    wx.login({
      success(res) {
        wx.request({
          url: app.globalData.gateway + 'login',
          method: 'GET',
          data: {
            'token': res.code
          },
          success: function (res) {
            if (res.data.code==0){
            that.setData({
              'isadmin': res.data.isadmin,
              'islogin': 1
            })}else{
              that.setData({
                msg:res.data.msg,
                openid:res.data.openid
              })              
            }
          }
        })
      }
    })
  },
  onPageScroll: function (t) {
    var that = this;
    that.setData({
      bgAlpha:t.scrollTop/100
    })},
  CopyText(e) {
    wx.setClipboardData({
        data: e.currentTarget.dataset.link,
      })
  },

  Commit(r) {
    var that=this
    var sid = String(r.currentTarget.dataset.id)    
    wx.showModal({
      title: 'Sid'+sid,
      content: '拒绝收录的作品将会被直接删除，请谨慎操作',
      confirmText:'通过',
      cancelText:'拒绝',
      complete (e) {
        that.data.list.splice(r.currentTarget.dataset.index, 1)
        that.setData({
          list: that.data.list
        })
      },
      success (e) {
        wx.login({
          success(res) {
            wx.request({
              url: app.globalData.gateway + 'approval',
              method: 'POST',
              data: {
                'token': res.code,
                'action':e.confirm,
                'sid':sid
              },
              success: function (res) {
                if (res.data.code==0){
                that.setData({
                  'isadmin': res.data.isadmin,
                  'islogin': 1
                })}else{
                  that.setData({
                    msg:res.data.msg,
                    openid:res.data.openid
                  })              
                }
              }, 
            })
          }
        })

      }
    })
  },

})