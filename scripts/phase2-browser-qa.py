from pathlib import Path
import json, time
from playwright.sync_api import sync_playwright

BASE='http://127.0.0.1:3411/alpha/'
OUT=Path('docs/visual-qa/ui-recovery-phase2')
OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS=[(1920,1080),(1600,900),(1440,900),(1366,768)]


def create_campaign(page, sex='male'):
    page.goto(BASE, wait_until='networkidle')
    page.fill('input[name="name"]', f'QA {sex.title()}')
    page.select_option('select[name="sex"]', sex)
    for _ in range(5):
        page.get_by_text('Next ›', exact=True).click()
        page.wait_for_timeout(40)
    page.get_by_text('Enter the world', exact=True).click()
    page.wait_for_timeout(250)
    # Visual QA captures stable screen state, not transient toast timing.
    page.evaluate("document.querySelectorAll('.toast').forEach(n=>n.remove())")


def open_inventory(page):
    page.get_by_role('button', name='Captain', exact=True).click()
    page.wait_for_timeout(100)
    page.get_by_role('button', name='Inventory / Equipment', exact=True).click()
    page.wait_for_timeout(180)


def open_market(page):
    page.get_by_role('button', name='Market', exact=True).click()
    page.wait_for_timeout(180)


def rect(page, selector):
    return page.eval_on_selector(selector, '''el => { const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; }''')


def metrics(page, screen, variant):
    data=page.evaluate('''() => {
      const de=document.documentElement, body=document.body, main=document.querySelector('.main');
      const mr=main?.getBoundingClientRect();
      return {
        viewport:{width:window.innerWidth,height:window.innerHeight},
        document:{scrollWidth:de.scrollWidth,scrollHeight:de.scrollHeight,clientWidth:de.clientWidth,clientHeight:de.clientHeight},
        body:{scrollWidth:body.scrollWidth,scrollHeight:body.scrollHeight},
        main:mr?{x:mr.x,y:mr.y,width:mr.width,height:mr.height,right:mr.right,bottom:mr.bottom}:null,
        uiScale:main?.dataset.uiScale || getComputedStyle(main||document.documentElement).getPropertyValue('--ui-scale') || null
      };
    }''')
    data['screen']=screen; data['variant']=variant
    if screen=='inventory':
        data['artHost']=rect(page,'.art-screen-host')
        data['artCanvas']=rect(page,'.art-directed-canvas')
        data['inventoryGrid']=rect(page,'.equipment-grid-region')
        data['itemDetail']=rect(page,'.equipment-detail-region')
        data['referenceGhostPresent']=page.locator('[data-reference-ghost]').count()>0
    elif screen=='market':
        data['marketBody']=rect(page,'.market-production-body')
        data['ledger']=rect(page,'.market-ledger-frame')
        data['summary']=rect(page,'.market-summary-card')
        data['referenceGhostPresent']=page.locator('[data-reference-ghost]').count()>0
    data['horizontalScroll']=data['document']['scrollWidth']>data['document']['clientWidth']+1
    data['verticalScroll']=data['document']['scrollHeight']>data['document']['clientHeight']+1
    return data

results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in VIEWPORTS:
        # Male inventory
        ctx=browser.new_context(viewport={'width':width,'height':height})
        page=ctx.new_page(); create_campaign(page,'male'); open_inventory(page)
        name=f'inventory-male-live-{width}x{height}.jpg'
        page.screenshot(path=str(OUT/name), type='jpeg', quality=88, full_page=False)
        results.append(metrics(page,'inventory','male'))
        if (width,height)==(1600,900):
            page.keyboard.press('Alt+Shift+C'); page.wait_for_timeout(120)
            page.screenshot(path=str(OUT/f'inventory-male-calibration-{width}x{height}.jpg'),type='jpeg',quality=88)
            page.keyboard.press('Alt+Shift+C'); page.wait_for_timeout(80)
            page.keyboard.press('Alt+Shift+G'); page.wait_for_timeout(120)
            page.screenshot(path=str(OUT/f'inventory-male-ghost50-{width}x{height}.jpg'),type='jpeg',quality=88)
        ctx.close()

        # Female inventory
        ctx=browser.new_context(viewport={'width':width,'height':height})
        page=ctx.new_page(); create_campaign(page,'female'); open_inventory(page)
        name=f'inventory-female-live-{width}x{height}.jpg'
        page.screenshot(path=str(OUT/name), type='jpeg', quality=88, full_page=False)
        results.append(metrics(page,'inventory','female'))
        if (width,height)==(1600,900):
            page.keyboard.press('Alt+Shift+C'); page.wait_for_timeout(120)
            page.screenshot(path=str(OUT/f'inventory-female-calibration-{width}x{height}.jpg'),type='jpeg',quality=88)
            page.keyboard.press('Alt+Shift+C'); page.wait_for_timeout(80)
            page.keyboard.press('Alt+Shift+G'); page.wait_for_timeout(120)
            page.screenshot(path=str(OUT/f'inventory-female-ghost50-{width}x{height}.jpg'),type='jpeg',quality=88)
        ctx.close()

        # Market
        ctx=browser.new_context(viewport={'width':width,'height':height})
        page=ctx.new_page(); create_campaign(page,'male'); open_market(page)
        name=f'market-live-{width}x{height}.jpg'
        page.screenshot(path=str(OUT/name), type='jpeg', quality=88, full_page=False)
        results.append(metrics(page,'market','default'))
        if (width,height)==(1600,900):
            page.keyboard.press('Alt+Shift+G'); page.wait_for_timeout(120)
            page.screenshot(path=str(OUT/f'market-ghost50-{width}x{height}.jpg'),type='jpeg',quality=88)
        ctx.close()
    browser.close()

# Add explicit pass/fail for basic geometry. Manual visual approval remains pending.
for row in results:
    row['automatedViewportPass'] = not row['horizontalScroll'] and not row['verticalScroll']

(OUT/'viewport-geometry.json').write_text(json.dumps({'generatedAt':'2026-09-08','results':results},indent=2))
print(json.dumps({'captures':len(list(OUT.glob('*.jpg'))),'geometryRows':len(results),'allNoDocumentScroll':all(r['automatedViewportPass'] for r in results)},indent=2))
