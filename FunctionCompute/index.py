# -*- coding: utf-8 -*-
import pymysql,os,random,requests,json
from aliyunhttpfc import *
from wxwork import *

def initializer(context):    
    global conn,cursor,wxwork
    conn = pymysql.connect(
        host=os.environ['sql_host'], 
        user=os.environ['sql_user'], 
        passwd=os.environ['sql_passwd'],
        database=os.environ['sql_database'],
        autocommit =True
    )
    cursor=conn.cursor()
    wxwork = WechatPush(os.environ["wx_corpid"],os.environ["wx_secret"],(os.environ["wx_agentid"]))

def prestop():
    cursor.close()
    conn.close()    

def handler(environ, start_response):
    print(environ)
    aliyun=aliyunhttpfc(environ, start_response)
    action=aliyun.path.split('/')[-1]
    parm=aliyun.query
    body=aliyun.body
    
    export={}
    if action=='index':
        export=index()
    
    if action=='all':
        export=all(parm.get('num',10),parm.get('offset',0),parm.get('cat','全部'))
    if action=='index':
        export=index()
    if action=='shortcut':
        export=shortcut(parm.get('sid',0))
    if action=='search':
        export=search(parm.get('keyword',''),parm.get('num',10),parm.get('offset',0))
    if action=='submit':
        export=submit(body.get('token',''),body.get('data',''))
    if action=='feedback':
        export=feedback(body)
    if action=='login':
        export=login(parm.get('token',0))
    if action=='suget':
        export=suget(parm.get('token',0),parm.get('sid',0))
    if action=='supost':        
        export=supost(body.get('token',''),body.get('data',{}),body.get('sid',0))
    if action=='sulist':        
        export=sulist(parm.get('token',0))
    if action=='approval':
        export=approval(body.get('token',''),body.get('action',{}),body.get('sid',0))
    if action=='sudel':
        export=sudel(body.get('token',''),body.get('sid',0))

    return aliyun.resp(json.dumps(export))

#构建主页数据
def index():
    output ={}    
    #获取分组信息
    sql="SELECT `category` FROM `data` GROUP BY `category`"
    cursor.execute(sql)
    data=cursor.fetchall()    
    print(data)
    category=[]
    for x in data:
        category.append(x[0])
    output['category']=category    
    #获取记录条数
    sql="SELECT `sid` FROM `data` ORDER BY `sid` DESC LIMIT 1"
    cursor.execute(sql)
    data=cursor.fetchone()        
    output['num']=data[0]
    #获取首页推荐数据
    sql="SELECT `sid`,`name`,`intro`,`color` FROM `data` WHERE `recommend` AND NOT `block`"
    cursor.execute(sql)
    data=cursor.fetchall()    
    shortcuts=[]
    for x in data:
        shortcuts.append(
            {
                'sid':x[0],
                'name':x[1],
                'intro':x[2],
                'color':x[3]
            }
        )
    output['shortcuts']=shortcuts
    #首页横幅数据
    sql="SELECT `sid`,`name`,`image` FROM `banner` WHERE `active`"
    cursor.execute(sql)
    data=cursor.fetchall()    
    banner=[]
    for x in data:
        banner.append(
            {
                'sid':x[0],
                'name':x[1],
                'image':x[2]
            }
        )
    output['banner']=banner
    return output
#构建全部数据
def all(num:int ,offset:int,category):
    output={}
    if category=='全部':
        sql="SELECT `sid`,`name`,`intro`,`color` FROM `data` WHERE NOT `block` ORDER BY `sid` DESC LIMIT {} OFFSET {}" .format(num,offset)
        cursor.execute(sql)
    else:
        sql="SELECT `sid`,`name`,`intro`,`color` FROM `data` WHERE `category` = %s AND NOT `block` ORDER BY `sid` DESC LIMIT {} OFFSET {}".format(num,offset) 
        cursor.execute(sql,category)
    data=cursor.fetchall()        
    shortcuts=[]
    for x in data:
        shortcuts.append(
            {
                'sid':x[0],
                'name':x[1],
                'intro':x[2],
                'color':x[3]
            }
        )
    #获取分组信息
    sql="SELECT `category` FROM `data` GROUP BY `category`"
    cursor.execute(sql)
    data=cursor.fetchall()    
    category=[]
    for x in data:
        category.append(x[0])
    output['category']=category    
    #获取记录条数
    sql="SELECT `sid` FROM `data` ORDER BY `sid` DESC LIMIT 1"
    cursor.execute(sql)
    data=cursor.fetchone()        
    num=data[0]
    output={
        'code':0,
        'msg':'success',
        'category':category,
        'num':num,
        'data':shortcuts
    }
    return output

#作品审批
def approval(token,action,sid):
    isadmin = login(token)['isadmin']
    if isadmin == False:
        msg={'code':403,'msg':'用户权限不足'}
    else:        
        if action==True:          
            sql="SELECT `userid`,`name` FROM `data` WHERE `sid`=%s" 
            cursor.execute(sql,sid)
            data=cursor.fetchone()    
            sql = 'UPDATE `data` SET `block` = 0 WHERE `data`.`sid` = %s' 
            cursor.execute(sql,sid)
            send_msg(data[0],'通过','%s发布成功感谢你的贡献' % data[1])
        else:            
            sql="SELECT `userid`,`name` FROM `data` WHERE `sid`=%s" 
            cursor.execute(sql,sid)
            data=cursor.fetchone()    
            sql = 'DELETE FROM `data` WHERE `data`.`sid` = %s' 
            cursor.execute(sql,sid)
            send_msg(data[0],'拒绝','抱歉%s不符合我们的收录标准' % data[1])        
        msg={'code':0,'msg':'处理完成'}    
    return msg
    
def sudel(token,sid):
    print(token,sid)
    isadmin = login(token)['isadmin']
    if isadmin == False:
        msg={'code':403,'msg':'用户权限不足'}
    else:                     
        sql = 'DELETE FROM `data` WHERE `data`.`sid` = %s'         
        cursor.execute(sql,sid)
        msg={'code':0,'msg':'处理完成'}      

    return msg
#接收举报
def feedback(data):
    wxwork.send_mpnotice('收到举报', "\n".join([data['name'],data['content']]), os.environ['wx_appid'], 'pages/admin/admin.html?sid=%s' % data['sid'],os.environ['wx_user'])
    msg={'code':0,'msg':'成功提交，我们会尽快处理'}    
    return msg
#换取openid
def getopenid(code):
    r = requests.get('https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code' % (os.environ['wx_appid'],os.environ['wx_appsecret'],code)) 
    openid = r.json().get('openid',None)
    return openid
#用户登录检查权限
def login(token):    
    openid=getopenid(token)    
    if openid != None:
        sql="SELECT `isadmin` FROM `user` WHERE `uid`=%s" 
        cursor.execute(sql,openid)
        data=cursor.fetchone()    
        if data:
            if data[0]==0:
                msg={'code':403,'msg':'权限不足','openid':openid,'isadmin':0}
            else:
                msg={'code':0,'msg':'登陆成功','openid':openid,'isadmin':1}
        else:
            sql="INSERT INTO `user` (`uid`, `isadmin`) VALUES (%s, 0)" 
            cursor.execute(sql,openid)
            msg={'code':403,'msg':'账号已创建请将OpenID提供给超管','openid':openid,'isadmin':False}
    else:
        msg={'code':401,'msg':'登陆失败','isadmin':False}
    return msg
#超级用户修改详情数据
def supost(token,data,sid):
    isadmin = login(token)['isadmin']
    if isadmin == False:
        msg={'code':403,'msg':'用户权限不足'}
    else:
        params=json.loads(data)
        keys=[]
        for k,v in params.items():
            key="`%s`='%s'" % (k,v)
            keys.append(key)
        sql="UPDATE `data` SET %s WHERE `sid` = %s" 
        cursor.execute(sql,(','.join(keys),sid))
        msg={'code':0,'msg':'修改完成'}        
    return msg

#超级用户获取详情数据    
def suget(token,sid):
    isadmin = login(token)['isadmin']
    if isadmin == False:
        msg={'code':403,'msg':'用户权限不足'}
    else:
        sql="SELECT `sid`,`name`,`intro`,`url`,`author`,`color`,`category`,`homepage`,`recommend`,`block` FROM `data` WHERE `sid`=%s" 
        cursor.execute(sql,sid)
        data=cursor.fetchone()    
        if data:
            output={
                'sid':data[0],'name':data[1],'intro':data[2],'url':data[3],'author':data[4],'color':data[5],'category':data[6],'homepage':data[7],'recommend':data[8],'block':data[9]
            }
        else:
            output={}
        msg={'code':0,'msg':'ok','data':output}        
    return msg

#超级用户检查待审查列表
def sulist(token):
    isadmin = login(token)['isadmin']
    if isadmin == False:
        msg={'code':403,'msg':'用户权限不足','data':{}}
    else:
        sql="SELECT `sid`,`name`,`intro`,`author`,`category`,`color`,`url` FROM `data` WHERE `block` ORDER BY `sid` DESC"
        cursor.execute(sql)
        data=cursor.fetchall()    
        shortcuts=[]
        for x in data:
            shortcuts.append(
                {
                    'sid':x[0],
                    'name':x[1],
                    'intro':x[2],
                    'author':x[3],
                    'category':x[4],
                    'color':x[5],
                    'url':x[6]
                }
            )        
        msg={'code':0,'msg':'ok','data':shortcuts}        
    return msg
#接收投稿    
def submit(token,data):    
    colors=["black","red","blue","yellow","pink","green","grey","purple","cyan","brown","olive","orange"]    
    body=json.loads(data)
    del body['assistance']
    body['block']=1    
    body['userid']=getopenid(token)    
    body['color']=random.choice(colors)
    key=[]
    value=[]
    for k,v in body.items():
        key.append('`%s`' % k)
        value.append('"%s"'% v)
    sql="INSERT INTO `data` (%s) VALUES (%s)" 
    cursor.execute(sql,(','.join(key),','.join(value)))
    wxwork.send_mpnotice('审批通知', "\n".join([body['name'],body['intro']]), os.environ['wx_appid'], 'pages/admin/list.html?sid=%s'% cursor.lastrowid,os.environ['wx_user'])    
    res = {'code': 0, 'msg': '提交成功，我们将通过微信消息通知您收录结果'}
    return res

#搜索
def search(keyword,num:int,offset):
    output={}    
    if keyword=='':
        sql="SELECT `sid`,`name`,`intro`,`color`  FROM `data` ORDER BY rand() LIMIT %s" % num
        cursor.execute(sql)
    else:
        sql="SELECT `sid`,`name`,`intro`,`color` FROM `data` WHERE NOT `block` AND `name` like %s ORDER BY `sid` DESC LIMIT {} OFFSET {}" .format(num,offset)
        cursor.execute(sql,"%"+keyword+"%")
    data=cursor.fetchall()    
    shortcuts=[]
    for x in data:
        shortcuts.append(
            {
                'sid':x[0],
                'name':x[1],
                'intro':x[2],
                'color':x[3]
            }
        )

    output={
        'code':0,
        'msg':'success',
        'data':shortcuts
    }
    return output
#详情页构建    
def shortcut(id):    
    sql="SELECT `sid`,`name`,`intro`,`url`,`author`,`homepage` FROM `data` WHERE `sid`=%s AND NOT `block`" 
    cursor.execute(sql,id)
    data=cursor.fetchone()    
    if data:
        output={
            'sid':data[0],'name':data[1],'intro':data[2],'url':data[3],'author':data[4],'homepage':data[5]
        }
    else:
        output={}
    
    return output

#发送消息给用户    
def send_msg(openid,msg1,msg2):  
    r = requests.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s' % (os.environ['wx_appid'],os.environ['wx_appsecret']))
    _access_token = json.loads(r.content).get('access_token')
    _wechat_api = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + str(_access_token)
    _headers = {'Content-Type': 'application/json'}
    _data = {
        "touser": openid, 
        "template_id": os.environ['wx_template_id'], 
        "page": "pages/index/index", 
        "data": {
          "phrase2": {
            "value": msg1
          },
          "time3": {
            "value": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
          },
          "thing4": {
            "value": msg2
          }
        }
    } 
    r = requests.post( _wechat_api, headers=_headers, json=_data)
    export=r.json()
    return r