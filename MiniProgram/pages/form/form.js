import WxValidate from 'WxValidate';
const app = getApp();

Page({
  data: {
    category: [],
    form_info: '',
    index: null,
  },
  onLoad: function (options) {
    var that = this;
    var category = wx.getStorageSync('category');
    that.setData({
      category: category
    })
    this.initValidate();
  },

  onPullDownRefresh() {
    getCurrentPages()[getCurrentPages().length - 1].onLoad();
    wx.stopPullDownRefresh();
  },

  PickerChange(e) {
    var that = this;
    that.setData({
      index: e.detail.value
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
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    this.submitInfo(params);
  },
  SubscribeMessage(e) {
    wx.requestSubscribeMessage({ 
      tmplIds: [app.globalData.msgtmplid], 
      success: (res) => {
        if (res[app.globalData.msgtmplid] == 'reject') { 
          wx.showToast({
            title: '由于您拒绝我们向您发送消息，请手动查询收录结果',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  submitInfo(form) {
    var that = this;
    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: app.globalData.gateway + 'submit',
            method: 'POST',
            data: {
              data: JSON.stringify(form),
              token: res.code
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {              
              if (res.data.code == 0) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 2000
                })
                that.setData({
                  form_info: ''
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 2000
                })
              }
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
      category: {
        required: true,
      },
      assistance: {
        required: true,
        assistance: true,
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
      category: {
        required: '请选择类型',
      },
      homepage: {
        url: '请填写正确的主页地址',
      },
      assistance: {
        required: '请勾选版权承诺'
      },
      intro: {
        required: '请填写作品简介',
        minlength: '请填写作品简介',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
    this.WxValidate.addMethod('assistance', (value, param) => {
      return this.WxValidate.optional(value) || (value.length >= 1 && value.length <= 2)
    }, '请勾选版权承诺')
  },
})