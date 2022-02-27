# 程序简介

这个家伙很懒，从不写简介，具体功能请进入  [捷径沙盒小程序](weixin://dl/business/?t=HmDrzjgz5Uj) 自行查看

![](https://kim.xcjkwl.com/images/jjsh.jpg)

# 部署方式

首先进入 [阿里云函数](https://www.aliyun.com/) 开通MySql数据库和函数计算2款产品
> 由于个人精力有限，本程序目前只适配了阿里云，使用其他云的用户可自行修改，并欢迎Pull Request

1. 在MySql数据库中创建实例，将本仓库中 ` /Datebase/db.sql ` 导入数据库
2. 在函数计算中创建 `通过 HTTP 请求触发` 的函数，并上传 ` /FunctionCompute ` 目录下的全部文件到代码包中
3. 设置函数的环境变量，添加以下变量
    ```
    sql_database: MySql数据库实例名
    sql_host: MySql数据库实例的EndPoint
    sql_passwd: MySql数据库密码
    sql_user: MySql数据库用户名    
    wx_appid: 你的小程序AppID
    wx_appsecret: 你的小程序密钥    
    wx_template_id: 模板消息ID (用于给投稿用户发送通知)
    wx_agentid: 你的企业微信的程序ID (用于接收管理通知，无需通知可留空)
    wx_secret: 你的企业微信的程序密钥 (用于接收管理通知，无需通知可留空)
    wx_corpid: 你的企业微信组织ID (用于接收管理通知，无需通知可留空)
    ```
4. 创建 [微信小程序](https://mp.weixin.qq.com/)，并在订阅消息中申请 `投稿审核通知` 模板
5. 将 `/MiniProgram` 目录下的所有文件导入 微信开发者工具
6. 修改 `app.js` 中的3~4行填入对应信息
    ```
    globalData: {
        gateway : '', //阿里云函数HTTP触发器的公网访问地址
        msgtmplid: '', //后台申请的投稿审核通知消息模板ID
    },
    ```
7. 上传代码，提交审查

# 管理方式

1. 在关于页面长按最下方的版权信息文字可进入投稿审查页面
2. 长按快捷指令的详情页面最下方版权信息可编辑当前页面信息
3. 首次进入管理模式会自动在数据库中记录OpenID，在数据库的user表中修改对应行的isadmin字段为非0数字即可赋予管理权限

# 打赏作者

![](https://kim.xcjkwl.com/images/wechat.png)
