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
      title: '????????????',
      content: '',
      placeholderText: '?????????sid',
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
      title: '???????????????',
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
                    title: '????????????',
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
          console.log('??????????????????')
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
            title: '??????????????????????????????????????????',
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
    // ???????????????????????????????????????????????????????????????
    const messages = {
      name: {
        required: '????????????????????????',
        minlength: '?????????????????????2?????????'
      },
      url: {
        required: '?????????????????????',
        url: '??????????????????URL??????',
        contains: '?????????iCloud????????????'
      },
      author: {
        required: '????????????????????????????????????????????????????????????????????????',
        minlength: '????????????????????????????????????????????????????????????????????????',
      },
      homepage: {
        url: '??????????????????????????????',
      },
      intro: {
        required: '?????????????????????',
        minlength: '?????????????????????',
      },
    }
    // ??????????????????
    this.WxValidate = new WxValidate(rules, messages)
  },
})