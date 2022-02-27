import os,requests,json,logging
from urllib.parse import parse_qsl

class aliyunhttpfc:
    def __init__(self,environ,start_response):
        self.environ = environ        
        self.log = logging.getLogger()          
        self.type = environ['CONTENT_TYPE']
        self.env = dict(os.environ)
        self.start = start_response    
        self.sts = self.__get_access_token(environ['fc.context'])
        self.body = self._body()
        self.query = self._query()
        self.header = self._headers()
        self.ip = self.environ.get('HTTP_ALI_CDN_REAL_IP',self.environ['REMOTE_ADDR'])
        self.path = environ['PATH_INFO']
        self.method = environ['REQUEST_METHOD']
        self.uri = environ['fc.request_uri']

    def __get_access_token(self,context):
        creds = context.credentials    
        auth = (creds.access_key_id, creds.access_key_secret, creds.security_token)
        return auth

    def resp(self,content,ctf='application/json',stat = '200 OK'):
        status = stat
        response_headers = [('Content-type', ctf)]        
        self.start(status, response_headers)     
        return  [str(content).encode('UTF-8')]

    def _body(self):
        try:        
            request_body_size = int(self.environ.get('CONTENT_LENGTH', 0))    
        except (ValueError):        
            request_body_size = 0   
        request_body = self.environ['wsgi.input'].read(request_body_size)
        data=request_body.decode('utf8')
        if "application/json" in self.type:
            try:
                data=json.loads(data)
            except:
                pass
        if "application/x-www-form-urlencoded" in self.type:
            data = dict(parse_qsl(data))
        return data        

    def _query(self):
        try:        
            query_string = self.environ['QUERY_STRING']
            data = dict(parse_qsl(query_string))
        except:        
            data = {}
        return data

    def _headers(self):
        data={}
        for k, v in self.environ.items():        
            if k.startswith("HTTP_"):            
                data[k.replace("HTTP_","")]=v
        return data


