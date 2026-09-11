#!/usr/bin/env python3
import base64,json,time,sys
from pathlib import Path
import requests,websocket
DEBUG='http://127.0.0.1:9227'; BASE='http://127.0.0.1:3077/alpha/?artCalibration=0'
OUT=Path('docs/visual-qa/art-screen-integration'); OUT.mkdir(parents=True,exist_ok=True)
MALE=Path('/mnt/data/hf9_qa_male.json').read_text(); FEMALE=Path('/mnt/data/hf9_qa_female.json').read_text(); ENCOUNTER=Path('/mnt/data/hf9_qa_encounter.json').read_text()
VPS=[(1920,1080),(1600,900),(1440,900),(1366,768)]
SC={'equipment_male':(MALE,'[data-tab="inventory"]','[data-action="set-character-subtab"][data-owner="captain"][data-view="gear"]'),'equipment_female':(FEMALE,'[data-tab="inventory"]','[data-action="set-character-subtab"][data-owner="captain"][data-view="gear"]'),'ship_management':(MALE,'[data-tab="ship"]',None),'market':(MALE,'[data-tab="market"]',None),'crew_roster':(MALE,'[data-tab="crew"]',None),'journal':(MALE,'[data-tab="journal"]',None),'naval_encounter':(ENCOUNTER,None,None),'character_creator':(None,None,None)}
class C:
 def __init__(self):
  p=next(p for p in requests.get(DEBUG+'/json',timeout=5).json() if p['type']=='page');self.ws=websocket.create_connection(p['webSocketDebuggerUrl'],timeout=15);self.i=0;self.call('Page.enable');self.call('Runtime.enable')
 def call(self,m,p=None):
  self.i+=1;i=self.i;self.ws.send(json.dumps({'id':i,'method':m,'params':p or {}}))
  while 1:
   x=json.loads(self.ws.recv())
   if x.get('id')==i:
    if 'error'in x:raise RuntimeError(x['error'])
    return x.get('result',{})
 def ev(self,e):
  x=self.call('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True});
  if x.get('exceptionDetails'):raise RuntimeError(x['exceptionDetails'])
  return x.get('result',{}).get('value')
 def nav(self,u):self.call('Page.navigate',{'url':u});time.sleep(.4)
 def vp(self,w,h):self.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False,'screenWidth':w,'screenHeight':h});time.sleep(.08)
 def shot(self,p):
  x=self.call('Page.captureScreenshot',{'format':'jpeg','quality':58,'fromSurface':True,'captureBeyondViewport':False});Path(p).write_bytes(base64.b64decode(x['data']))
c=C();c.nav(BASE)
def clear_toast():c.ev("document.querySelectorAll('.toast').forEach(e=>e.remove())")
def load(name):
 st,sel,sub=SC[name]
 if st is None:c.ev("localStorage.removeItem('ebbing-tides.alpha.save');sessionStorage.clear()");c.nav(BASE);clear_toast();return
 c.ev("localStorage.setItem('ebbing-tides.alpha.save',"+json.dumps(st)+");sessionStorage.clear()");c.nav(BASE);c.ev("document.querySelector('[data-action=\"continue-save\"]')?.click()");time.sleep(.1)
 if sel:c.ev('document.querySelector('+json.dumps(sel)+')?.click()');time.sleep(.08)
 if sub:c.ev('document.querySelector('+json.dumps(sub)+')?.click()');time.sleep(.08)
 clear_toast()
def toggle():c.ev("window.dispatchEvent(new KeyboardEvent('keydown',{altKey:true,shiftKey:true,code:'KeyC',bubbles:true}))");time.sleep(.08)
def populate(name):
 if name=='character_creator':c.ev("document.querySelector('[data-action=\"creator-step\"][data-step=\"4\"]')?.click()")
 elif name=='journal':c.ev("document.querySelector('[data-action=\"journal-tab\"][data-tab-id=\"history\"]')?.click()")
 elif name=='crew_roster':c.ev("document.querySelector('[data-action=\"crew-page\"][data-dir=\"1\"]')?.click()")
 elif name.startswith('equipment_'):c.ev("document.querySelectorAll('[data-action=\"inspect-item\"]')[1]?.click()")
 time.sleep(.08);clear_toast()
names=sys.argv[1:] or list(SC)
for name in names:
 if name not in SC: raise SystemExit(f'unknown {name}')
 load(name)
 for phase in ['A_live','B_calibration','C_populated']:
  if phase=='B_calibration':toggle()
  if phase=='C_populated':toggle();populate(name)
  for w,h in VPS:
   c.vp(w,h);clear_toast();c.shot(OUT/f'{name}_{w}x{h}_{phase}.jpg')
 print(name,'done')
