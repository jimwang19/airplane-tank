// Upload prototype screenshots to Linear issues
// Usage: LINEAR_API_KEY=lin_api_xxx node upload-to-linear.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS = [
  { issue: 'AIR-43', file: '01-start.png', title: '开始界面原型', subtitle: '01 · 开始界面' },
  { issue: 'AIR-15', file: '02-playing.png', title: '游戏中原型', subtitle: '02 · 游戏中' },
  { issue: 'AIR-12', file: '03-boss.png', title: 'Boss战原型', subtitle: '03 · Boss 战' },
  { issue: 'AIR-34', file: '04-wave-trans.png', title: '波次过渡原型', subtitle: '04 · 波次过渡' },
  { issue: 'AIR-43', file: '05-pause.png', title: '暂停原型', subtitle: '05 · 暂停' },
  { issue: 'AIR-44', file: '06-game-over.png', title: '游戏结束原型', subtitle: '06 · 游戏结束' },
  { issue: 'AIR-43', file: '07-tutorial.png', title: '操作指南原型', subtitle: '07 · 操作指南' },
  { issue: 'AIR-39', file: '08-weapon.png', title: '武器等级原型', subtitle: '08 · 武器等级对比' },
  { issue: 'AIR-10', file: '08b-enemy.png', title: '敌人类型原型', subtitle: '08 · 敌人类型对比' },
  { issue: 'AIR-25', file: '09-fx.png', title: '战斗特效原型', subtitle: '09 · 受击闪烁 & 炸弹闪白' },
  { issue: 'AIR-30', file: '09b-popup.png', title: '分数上飘原型', subtitle: '09 · 分数上飘 & 爆炸粒子' },
  { issue: 'AIR-38', file: '10-powerups.png', title: '状态增益原型', subtitle: '10 · 护盾 & 双倍分 & 炸弹禁用' },
];

const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) {
  console.error('Set LINEAR_API_KEY env var first');
  process.exit(1);
}

const SCREENS_DIR = path.join(__dirname, 'screenshots');

function graphql(query, variables) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'api.linear.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function issueIdFromIdentifier(identifier) {
  return graphql(
    `query($id: String!) { issue(id: $id) { id } }`,
    { id: identifier }
  ).then(r => r.data?.issue?.id);
}

function prepareUpload(issueId, filename, contentType, size, title, subtitle) {
  return graphql(
    `mutation($issueId: String!, $filename: String!, $contentType: String!, $size: Float!, $title: String, $subtitle: String) {
      attachmentPrepareUpload(input: {issueId: $issueId, filename: $filename, contentType: $contentType, size: $size, title: $title, subtitle: $subtitle}) {
        success
        attachment { id url assetUrl }
        uploadRequest { url method headers { key value } }
      }
    }`,
    { issueId, filename, contentType, size, title, subtitle }
  ).then(r => r.data?.attachmentPrepareUpload);
}

function putFile(uploadUrl, headers, filePath) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const url = new URL(uploadUrl);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PUT',
      headers: Object.fromEntries([
        ...headers.map(h => [h.key, h.value]),
        ['Content-Length', fileData.length],
      ]),
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

function finalizeUpload(attachmentId, assetUrl) {
  return graphql(
    `mutation($id: String!, $assetUrl: String!) {
      attachmentFinalizeUpload(input: {id: $id, assetUrl: $assetUrl}) {
        success
        attachment { id title url }
      }
    }`,
    { id: attachmentId, assetUrl }
  ).then(r => r.data?.attachmentFinalizeUpload);
}

(async () => {
  const issueIds = {};
  const issues = [...new Set(UPLOADS.map(u => u.issue))];
  for (const key of issues) {
    console.log(`Resolving ${key}...`);
    const id = await issueIdFromIdentifier(key);
    if (!id) { console.error(`Issue ${key} not found`); process.exit(1); }
    issueIds[key] = id;
  }

  for (const u of UPLOADS) {
    const filePath = path.join(SCREENS_DIR, u.file);
    const size = fs.statSync(filePath).size;
    const issueId = issueIds[u.issue];

    console.log(`Uploading ${u.file} → ${u.issue}...`);

    const prepared = await prepareUpload(issueId, u.file, 'image/png', size, u.title, u.subtitle);
    if (!prepared?.success) {
      console.error(`  Prepare failed:`, JSON.stringify(prepared ?? 'null'));
      // Log full GraphQL response for debug
      const raw = await graphql(
        `mutation($issueId: String!, $filename: String!, $contentType: String!, $size: Float!, $title: String, $subtitle: String) {
          attachmentPrepareUpload(input: {issueId: $issueId, filename: $filename, contentType: $contentType, size: $size, title: $title, subtitle: $subtitle}) {
            success
            attachment { id url assetUrl }
            uploadRequest { url method headers { key value } }
          }
        }`,
        { issueId, filename: u.file, contentType: 'image/png', size, title: u.title, subtitle: u.subtitle }
      );
      console.error(`  Raw response:`, JSON.stringify(raw).substring(0, 500));
      continue;
    }

    const putResult = await putFile(prepared.uploadRequest.url, prepared.uploadRequest.headers, filePath);
    if (putResult.status !== 200) {
      console.error(`  PUT failed: HTTP ${putResult.status}`, putResult.data);
      continue;
    }

    const finalized = await finalizeUpload(prepared.attachment.id, prepared.attachment.assetUrl);
    if (!finalized?.success) {
      console.error(`  Finalize failed:`, JSON.stringify(finalized));
      continue;
    }

    console.log(`  ✓ ${u.file} → ${u.issue}`);
  }

  console.log('Done!');
})();
