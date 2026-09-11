#!/usr/bin/env python3
import base64, json, os, time, urllib.parse
from pathlib import Path
import requests, websocket

DEBUG='http://127.0.0.1:9227'
BASE='http://127.0.0.1:3077/alpha/'
OUT=Path('docs/visual-qa/art-screen-integration')
OUT.mkdir(parents=True,exist_ok=True)
MALE=Path('/mnt/data/hf9_qa_male.json').read_text()
FEMALE=Path('/mnt/data/hf9_qa_female.json').read_text()
ENCOUNTER=Path('/mnt/data/hf9_qa_encounter.json').read_text()
VIEWPORTS=[(1920,1080),(1600,900),(1440,900),(1366,768)]

class CDP:
    def __init__(self):
        pages=requests.get(DEBUG+'/json',timeout=5).json()
        page=next(p for p in pages if p.get('type')=='page')
        self.ws=websocket.create_connection(page['webSocketDebuggerUrl'],timeout=10)
        self.i=0
        self.call('Page.enable'); self.call('Runtime.enable')
    def call(self,method,params=None):
        self.i+=1; ident=self.i
        self.ws.send(json.dumps({'id':ident,'method':method,'params':params or {}}))
        while True:
            msg=json.loads(self.ws.recv())
            if msg.get('id')==ident:
                if 'error' in msg: raise RuntimeError(f'{method}: {msg["error"]}')
                return msg.get('result',{})
    def eval(self,expr):
        r=self.call('Runtime.evaluate',{'expression':expr,'returnByValue':True,'awaitPromise':True})
        if r.get('exceptionDetails'): raise RuntimeError(r['exceptionDetails'])
        return r.get('result',{}).get('value')
    def viewport(self,w,h):
        self.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False,'screenWidth':w,'screenHeight':h})
    def navigate(self,url,wait=0.65):
        self.call('Page.navigate',{'url':url})
        deadline=time.time()+8
        while time.time()<deadline:
            try:
                if self.eval('document.readyState')=='complete': break
            except Exception: pass
            time.sleep(.05)
        time.sleep(wait)
    def screenshot(self,path):
        r=self.call('Page.captureScreenshot',{'format':'jpeg','quality':78,'fromSurface':True,'captureBeyondViewport':False})
        Path(path).write_bytes(base64.b64decode(r['data']))
    def close(self): self.ws.close()

cdp=CDP()
cdp.navigate(BASE+'?artCalibration=0')

screen_defs={
 'equipment_male': {'state':MALE,'selector':'[data-tab="inventory"]','sub':'[data-action="set-character-subtab"][data-owner="captain"][data-view="gear"]'},
 'equipment_female': {'state':FEMALE,'selector':'[data-tab="inventory"]','sub':'[data-action="set-character-subtab"][data-owner="captain"][data-view="gear"]'},
 'ship_management': {'state':MALE,'selector':'[data-tab="ship"]'},
 'market': {'state':MALE,'selector':'[data-tab="market"]'},
 'crew_roster': {'state':MALE,'selector':'[data-tab="crew"]'},
 'journal': {'state':MALE,'selector':'[data-tab="journal"]'},
 'naval_encounter': {'state':ENCOUNTER},
 'character_creator': {'state':None,'creator':True},
}

def load_screen(info,calibration=False,populated=False):
    q='?artCalibration=1' if calibration else '?artCalibration=0'
    if info.get('creator'):
        cdp.eval("localStorage.removeItem('ebbing-tides.alpha.save'); sessionStorage.clear();")
        cdp.navigate(BASE+q)
        if populated:
            # Portrait page gives representative dynamic gallery state.
            cdp.eval("document.querySelector('[data-action=\"creator-step\"][data-step=\"4\"]')?.click()")
            time.sleep(.25)
        return
    state=info['state']
    cdp.eval("localStorage.setItem('ebbing-tides.alpha.save',"+json.dumps(state)+"); sessionStorage.clear();")
    cdp.navigate(BASE+q)
    # Continue existing save.
    cdp.eval("document.querySelector('[data-action=\"continue-save\"]')?.click()")
    time.sleep(.22)
    if info.get('selector'):
        cdp.eval("document.querySelector("+json.dumps(info['selector'])+")?.click()")
        time.sleep(.20)
    if info.get('sub'):
        cdp.eval("document.querySelector("+json.dumps(info['sub'])+")?.click()")
        time.sleep(.20)
    if populated and info.get('selector')=='[data-tab="journal"]':
        cdp.eval("document.querySelector('[data-action=\"journal-tab\"][data-tab=\"history\"]')?.click()")
        time.sleep(.15)
    if populated and info.get('selector')=='[data-tab="crew"]':
        # Keep roster visible but use the second page when available.
        cdp.eval("document.querySelector('[data-action=\"crew-page\"][data-dir=\"1\"]')?.click()")
        time.sleep(.15)
    if populated and info.get('sub'):
        # Select the second inventory cell where possible so detail/selection state is represented.
        cdp.eval("document.querySelectorAll('[data-action=\"inspect-item\"]')[1]?.click()")
        time.sleep(.15)

def geometry():
    js=r'''(()=>{
      const r=(sel)=>{const e=document.querySelector(sel);if(!e)return null;const x=e.getBoundingClientRect();return {left:x.left,top:x.top,right:x.right,bottom:x.bottom,width:x.width,height:x.height,clientWidth:e.clientWidth,clientHeight:e.clientHeight,scrollWidth:e.scrollWidth,scrollHeight:e.scrollHeight};};
      const host=document.querySelector('[data-art-screen-host]');
      const canvas=document.querySelector('.art-directed-canvas');
      const img=canvas?.querySelector('[data-art-base-image]');
      const overflowingRegions=[...document.querySelectorAll('.art-directed-region')].filter(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2).map(e=>({region:e.dataset.artLayerRegion||'',className:e.className,clientWidth:e.clientWidth,clientHeight:e.clientHeight,scrollWidth:e.scrollWidth,scrollHeight:e.scrollHeight,overflow:getComputedStyle(e).overflow,overflowY:getComputedStyle(e).overflowY}));
      const doc=document.documentElement;
      return {viewport:{width:innerWidth,height:innerHeight},topbar:r('.topbar'),navRail:r('.navrail'),main:r('.main'),artHost:r('[data-art-screen-host]'),canvas:r('.art-directed-canvas'),layoutId:host?.dataset.artLayoutId||null,screenScroll:host?.dataset.artScreenScroll||null,nativeArt:canvas?{width:Number(canvas.dataset.artNativeWidth),height:Number(canvas.dataset.artNativeHeight)}:null,naturalArt:img?{width:img.naturalWidth,height:img.naturalHeight}:null,dimensionMismatch:Boolean(canvas?.classList.contains('art-dimension-mismatch')),document:{clientWidth:doc.clientWidth,clientHeight:doc.clientHeight,scrollWidth:doc.scrollWidth,scrollHeight:doc.scrollHeight},overflowingRegions};
    })()'''
    g=cdp.eval(js)
    tol=2.5
    host=g.get('artHost'); canv=g.get('canvas'); doc=g.get('document')
    contained=bool(host and canv and canv['left']>=host['left']-tol and canv['top']>=host['top']-tol and canv['right']<=host['right']+tol and canv['bottom']<=host['bottom']+tol)
    docNoH=doc['scrollWidth']<=doc['clientWidth']+2
    docNoV=doc['scrollHeight']<=doc['clientHeight']+2
    hostNoOverflow=True
    if host and g.get('screenScroll')=='none': hostNoOverflow=host['scrollWidth']<=host['clientWidth']+2 and host['scrollHeight']<=host['clientHeight']+2
    dims=(g.get('nativeArt')==g.get('naturalArt')) and not g.get('dimensionMismatch')
    allowed=True
    if g.get('layoutId')=='ui.combat.naval_encounter':
        allowed=all(('encounter-log-region' in x.get('className','')) for x in g.get('overflowingRegions',[]))
    else:
        allowed=len(g.get('overflowingRegions',[]))==0
    g['checks']={'canvasContained':contained,'noHorizontalDocumentScroll':docNoH,'noVerticalDocumentScroll':docNoV,'hostPolicySatisfied':hostNoOverflow,'sourceDimensionsMatch':dims,'overflowPolicySatisfied':allowed}
    g['pass']=all(g['checks'].values())
    return g

report={'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'browser':cdp.eval('navigator.userAgent'),'viewports':{},'screens':{}}

for w,h in VIEWPORTS:
    key=f'{w}x{h}'; report['viewports'][key]={'width':w,'height':h}; cdp.viewport(w,h)
    for name,info in screen_defs.items():
        entry=report['screens'].setdefault(name,{'viewports':{}})
        # Production/full live screen.
        load_screen(info,False,False)
        gA=geometry(); pA=OUT/f'{name}_{key}_A_live.jpg'; cdp.screenshot(pA)
        # Calibration in actual live shell.
        load_screen(info,True,False)
        gB=geometry(); pB=OUT/f'{name}_{key}_B_calibration.jpg'; cdp.screenshot(pB)
        # Representative populated state.
        load_screen(info,False,True)
        gC=geometry(); pC=OUT/f'{name}_{key}_C_populated.jpg'; cdp.screenshot(pC)
        entry['viewports'][key]={'live':gA,'calibration':gB,'populated':gC,'screenshots':{'live':str(pA),'calibration':str(pB),'populated':str(pC)},'pass':gA['pass'] and gB['pass'] and gC['pass']}

report['pass']=all(vp['pass'] for s in report['screens'].values() for vp in s['viewports'].values())
(OUT/'browser-geometry.json').write_text(json.dumps(report,indent=2)+'\n')
print('Hotfix 9 browser QA:', 'PASS' if report['pass'] else 'FAIL')
for name,s in report['screens'].items():
    failed=[k for k,v in s['viewports'].items() if not v['pass']]
    print(name, 'PASS' if not failed else 'FAIL '+','.join(failed))
cdp.close()
