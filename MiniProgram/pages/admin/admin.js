import WxValidate from 'WxValidate';
const app = getApp();
Page({
  data: {
    cate: wx.getStorageSync('category'),
    index: null,
    islogin: 0,
    isadmin: 0,
    sid: 0,
    openid: '',
    msg: ''
  },
  onLoad: function (options) {
    var that = this;
    this.initValidate();
    if (this.data.islogin == 0) {
      that.login();
    }
    if (this.data.sid == 0) {
      that.setData({
        sid: options.sid
      })
    }
    if (this.data.sid != 0) {
      this.getSid(this.data.sid)
    }
  },

  onPullDownRefresh() {
    getCurrentPages()[getCurrentPages().length - 1].onLoad();
    wx.stopPullDownRefresh();
  },
  getSid(sid) {
    var that = this
    wx.login({
      success(res) {
        wx.request({
          url: app.globalData.gateway + 'suget',
          method: 'GET',
          data: {
            'sid': sid,
            'token': res.code,
          },
          success: function (res) {
            var data = res.data.data
            that.setData({
              'name': data.name,
              'url': data.url,
              'author': data.author,
              'homepage': data.homepage,
              'category': data.category,
              'intro': data.intro,
              'recommend': data.recommend,
              'block': data.block
            })
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
            if (res.data.code == 0) {
              that.setData({
                'isadmin': res.data.isadmin,
                'islogin': 1
              })
            } else {
              that.setData({
                msg: res.data.msg,
                openid: res.data.openid
              })

            }
          }
        })
      }
    })
  },

  CopyText(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.link,
    })
  },

  ChangeSid(e) {
    var that = this
    wx.showModal({
      title: '切换作品',
      content: '',
      placeholderText: '请输入sid',
      editable: true,
      success(res) {
        if (res.confirm) {
          that.setData({
            sid: res.content
          })
          that.getSid(res.content)
        }
      }
    })
  },

  PickerChange(e) {
    console.log(e)
    var that = this;
    that.setData({
      index: e.detail.value,
      category: that.data.cate[e.detail.value]
    })
  },

  del(e) {
    var that = this
    var sid = that.data.sid
    wx.showModal({
      title: '确认删除？',
      content: 'SID' + sid,
      success(res) {
        if (res.confirm) {
          wx.login({
            success(res) {
              wx.request({
                url: app.globalData.gateway + 'sudel',
                method: 'POST',
                data: {
                  'sid': sid,
                  'token': res.code,
                },
                success: function (res) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    mask: true,
                    duration: 4000,
                    success: res => {
                      wx.navigateBack({
                        delta: 1
                      });
                    }
                  })

                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },

  submitForm(e) {
    const params = e.detail.value
    params['recommend'] = this.data.recommend
    params['block'] = this.data.block
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    this.submitInfo(params);
  },

  submitInfo(params) {
    var that = this;
    let form = params;
    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: app.globalData.gateway + 'supost',
            method: 'POST',
            data: {
              data: JSON.stringify(form),
              sid: this.data.sid,
              token: res.code,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                mask:true,
                duration: 4000,
                success: res => {
                  wx.navigateBack({
                    delta: 1
                  });
                }
              })
            }
          })
        } else {
          wx.showToast({
            title: '登录失败，提交未成功，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  TapRecommend(e) {
    var that = this;
    if (this.data.recommend == 0) {
      that.setData({
        recommend: 1
      })
    } else {
      that.setData({
        recommend: 0
      })
    }
  },
  TapBlock(e) {
    var that = this;
    if (this.data.block == 0) {
      that.setData({
        block: 1
      })
    } else {
      that.setData({
        block: 0
      })
    }
  },

  initValidate() {
    const rules = {
      name: {
        required: true,
        minlength: 2,
      },
      url: {
        required: true,
        url: true,
        contains: 'icloud',
      },
      author: {
        required: true,
        minlength: 1,
      },
      homepage: {
        required: false,
        url: true,
      },
      intro: {
        required: true,
        minlength: 1,
      },
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      name: {
        required: '请输入捷径的名称',
        minlength: '捷径名称至少为2个汉字'
      },
      url: {
        required: '请输入下载地址',
        url: '请输入正确的URL地址',
        contains: '请输入iCloud连接地址'
      },
      author: {
        required: '请输入原作者昵称，若为您原创作品请输入自己的昵称',
        minlength: '请输入原作者昵称，若为您原创作品请输入自己的昵称',
      },
      homepage: {
        url: '请填写正确的主页地址',
      },
      intro: {
        required: '请填写作品简介',
        minlength: '请填写作品简介',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
})