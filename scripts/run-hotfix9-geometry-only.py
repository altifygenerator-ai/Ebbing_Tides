#!/usr/bin/env python3
import json,time
from pathlib import Path
import requests,websocket
DEBUG='http://127.0.0.1:9227';BASE='http://127.0.0.1:3077/alpha/?artCalibration=0'
OUT=Path('docs/visual-qa/art-screen-integration');OUT.mkdir(parents=True,exist_ok=True)
MALE=Path('/mnt/data/hf9_qa_male.json').read_text();FEMALE=Path('/mnt/data/hf9_qa_female.json').read_text();ENCOUNTER=Path('/mnt/data/hf9_qa_encounter.json').read_text();VPS=[(1920,1080),(1600,900),(1440,900),(1366,768)]
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
 def nav(self,u):self.call('Page.navigate',{'url':u});time.sleep(.55)
 def vp(self,w,h):self.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False,'screenWidth':w,'screenHeight':h});time.sleep(.12)
c=C();c.nav(BASE)
SC={'equipment_male':(MALE,'[data-tab="inventory"]','[data-action="set-character-subtab"][data-owner="captain"][data-view="gear"]'),'equipment_female':(FEMALE,'[data-tab="inventory"]','[data-action="set-character-subtab"][data-owner="captain"][data-view="gear"]'),'ship_management':(MALE,'[data-tab="ship"]',None),'market':(MALE,'[data-tab="market"]',None),'crew_roster':(MALE,'[data-tab="crew"]',None),'journal':(MALE,'[data-tab="journal"]',None),'naval_encounter':(ENCOUNTER,None,None),'character_creator':(None,None,None)}
def load(name):
 st,sel,sub=SC[name]
 if st is None:c.ev("localStorage.removeItem('ebbing-tides.alpha.save');sessionStorage.clear()");c.nav(BASE);return
 c.ev("localStorage.setItem('ebbing-tides.alpha.save',"+json.dumps(st)+");sessionStorage.clear()");c.nav(BASE);c.ev("document.querySelector('[data-action=\"continue-save\"]')?.click()");time.sleep(.15)
 if sel:c.ev('document.querySelector('+json.dumps(sel)+')?.click()');time.sleep(.12)
 if sub:c.ev('document.querySelector('+json.dumps(sub)+')?.click()');time.sleep(.12)
def toggle():c.ev("window.dispatchEvent(new KeyboardEvent('keydown',{altKey:true,shiftKey:true,code:'KeyC',bubbles:true}))");time.sleep(.15)
def populate(name):
 if name=='character_creator':c.ev("document.querySelector('[data-action=\"creator-step\"][data-step=\"4\"]')?.click()")
 elif name=='journal':c.ev("document.querySelector('[data-action=\"journal-tab\"][data-tab-id=\"history\"]')?.click()")
 elif name=='crew_roster':c.ev("document.querySelector('[data-action=\"crew-page\"][data-dir=\"1\"]')?.click()")
 elif name.startswith('equipment_'):c.ev("document.querySelectorAll('[data-action=\"inspect-item\"]')[1]?.click()")
 time.sleep(.1)
def geom():
 g=c.ev(r'''(()=>{const R=s=>{const e=document.querySelector(s);if(!e)return null;const q=e.getBoundingClientRect();return {left:q.left,top:q.top,right:q.right,bottom:q.bottom,width:q.width,height:q.height,clientWidth:e.clientWidth,clientHeight:e.clientHeight,scrollWidth:e.scrollWidth,scrollHeight:e.scrollHeight}};const H=document.querySelector('[data-art-screen-host]'),C=document.querySelector('.art-directed-canvas'),I=C?.querySelector('[data-art-base-image]'),D=document.documentElement;const O=[...document.querySelectorAll('.art-directed-region')].filter(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2).map(e=>({region:e.dataset.artLayerRegion||'',className:e.className,clientWidth:e.clientWidth,clientHeight:e.clientHeight,scrollWidth:e.scrollWidth,scrollHeight:e.scrollHeight,overflowY:getComputedStyle(e).overflowY}));return {viewport:{width:innerWidth,height:innerHeight},topbar:R('.topbar'),navRail:R('.navrail'),main:R('.main'),artHost:R('[data-art-screen-host]'),canvas:R('.art-directed-canvas'),layoutId:H?.dataset.artLayoutId||null,screenScroll:H?.dataset.artScreenScroll||null,nativeArt:C?{width:+C.dataset.artNativeWidth,height:+C.dataset.artNativeHeight}:null,naturalArt:I?{width:I.naturalWidth,height:I.naturalHeight}:null,dimensionMismatch:!!C?.classList.contains('art-dimension-mismatch'),document:{clientWidth:D.clientWidth,clientHeight:D.clientHeight,scrollWidth:D.scrollWidth,scrollHeight:D.scrollHeight},overflowingRegions:O}})()''')
 H=g['artHost'];C2=g['canvas'];D=g['document'];tol=2.5
 checks={'canvasContained':bool(H and C2 and C2['left']>=H['left']-tol and C2['top']>=H['top']-tol and C2['right']<=H['right']+tol and C2['bottom']<=H['bottom']+tol),'noHorizontalDocumentScroll':D['scrollWidth']<=D['clientWidth']+2,'noVerticalDocumentScroll':D['scrollHeight']<=D['clientHeight']+2,'hostPolicySatisfied':not H or g['screenScroll']!='none' or(H['scrollWidth']<=H['clientWidth']+2 and H['scrollHeight']<=H['clientHeight']+2),'sourceDimensionsMatch':g['nativeArt']==g['naturalArt'] and not g['dimensionMismatch']}
 checks['overflowPolicySatisfied']=all('encounter-log-region'in x['className'] for x in g['overflowingRegions']) if g['layoutId']=='ui.combat.naval_encounter' else len(g['overflowingRegions'])==0;g['checks']=checks;g['pass']=all(checks.values());return g
R={'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'browser':c.ev('navigator.userAgent'),'screens':{}}
for name in SC:
 load(name);R['screens'][name]={'viewports':{}}
 for phase in ['live','calibration','populated']:
  if phase=='calibration':toggle()
  if phase=='populated':toggle();populate(name)
  for w,h in VPS:c.vp(w,h);R['screens'][name]['viewports'].setdefault(f'{w}x{h}',{})[phase]=geom()
for s in R['screens'].values():
 for v in s['viewports'].values():v['pass']=all(v[p]['pass'] for p in ['live','calibration','populated'])
R['pass']=all(v['pass'] for s in R['screens'].values() for v in s['viewports'].values());(OUT/'browser-geometry.json').write_text(json.dumps(R,indent=2)+'\n');print('PASS' if R['pass'] else 'FAIL');
for n,s in R['screens'].items():print(n,[k for k,v in s['viewports'].items() if not v['pass']])
