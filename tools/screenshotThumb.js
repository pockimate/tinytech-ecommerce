import CDP from 'chrome-remote-interface';
import fs from 'fs';

(async () => {
  try {
    const client = await CDP();
    const {Page, DOM, Runtime, Emulation} = client;
    await Page.enable();
    await DOM.enable();
    await Runtime.enable();

    // Ensure page is loaded
    await Page.navigate({url: 'http://localhost:3001'});
    await Page.loadEventFired();

    // Evaluate in page to find a thumbnail img bounding rect
    const rectRes = await Runtime.evaluate({
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        // prefer small thumbnail-like images
        let candidate = imgs.find(i => i.clientWidth <= 120 && i.clientHeight >= 60 && i.clientHeight <= 180);
        if (!candidate) candidate = imgs[0];
        if (!candidate) return null;
        const r = candidate.getBoundingClientRect();
        return {left: r.left, top: r.top, width: r.width, height: r.height, dpr: window.devicePixelRatio};
      })()`,
      returnByValue: true,
    });

    if (!rectRes || !rectRes.result || !rectRes.result.value) {
      console.error('No thumbnail element found.');
      await client.close();
      process.exit(1);
    }

    const rect = rectRes.result.value;
    const clip = {
      x: rect.left * rect.dpr,
      y: rect.top * rect.dpr,
      width: rect.width * rect.dpr,
      height: rect.height * rect.dpr,
      scale: 1
    };

    const shot = await Page.captureScreenshot({format: 'png', clip});
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = 'tools/thumbnail-screenshot.png';
    fs.writeFileSync(outPath, buffer);
    console.log('Saved screenshot to', outPath);

    await client.close();
  } catch (err) {
    console.error('Error capturing screenshot:', err);
    process.exit(1);
  }
})();
