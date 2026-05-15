const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENS = [
  { id: '01-start', issue: 'AIR-43', shellIdx: 0 },
  { id: '02-playing', issue: 'AIR-15', shellIdx: 1 },
  { id: '03-boss', issue: 'AIR-12', shellIdx: 2 },
  { id: '04-wave-trans', issue: 'AIR-34', shellIdx: 3 },
  { id: '05-pause', issue: 'AIR-43', shellIdx: 4 },
  { id: '06-game-over', issue: 'AIR-44', shellIdx: 5 },
  { id: '07-tutorial', issue: 'AIR-43', shellIdx: 6 },
  { id: '08-weapon', issue: 'AIR-39', shellIdx: 7 },
  { id: '08b-enemy', issue: 'AIR-10', shellIdx: 8 },
  { id: '09-fx', issue: 'AIR-25', shellIdx: 9 },
  { id: '09b-popup', issue: 'AIR-30', shellIdx: 10 },
  { id: '10-powerups', issue: 'AIR-38', shellIdx: 11 },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const filePath = path.resolve(__dirname, 'ui-prototype-annotated.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  const outDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const screen of SCREENS) {
    const clip = await page.evaluate((idx) => {
      const labels = document.querySelectorAll('.screen-label');
      const label = labels[idx];
      if (!label) return null;
      const shell = label.closest('.screen-block')?.querySelector('.phone-shell') ||
                    label.closest('.screen-meta')?.querySelector('.phone-shell');
      if (!shell) return null;
      const rect = shell.getBoundingClientRect();
      return { x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20 };
    }, screen.shellIdx);

    if (!clip) {
      console.log(`Skipping ${screen.id}: shell not found at idx ${screen.shellIdx}`);
      continue;
    }

    const outFile = path.join(outDir, `${screen.id}.png`);
    await page.screenshot({ path: outFile, clip, type: 'png' });
    console.log(`Saved ${screen.id}.png (${screen.issue})`);
  }

  await browser.close();
  console.log('Done!');
})();
