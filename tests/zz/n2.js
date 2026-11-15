const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext();await c.grantPermissions(['notifications'],{origin:'http://localhost:8765'});const p=await c.newPage();
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(2500);console.log(await p.evaluate(()=>[Notification.permission, Notification.__xn]));await b.close()})()
