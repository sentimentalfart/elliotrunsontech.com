import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(import.meta.dirname, '../../');
const appsJsonPath = path.join(ROOT_DIR, 'src/data/apps.json');
const appsData = JSON.parse(fs.readFileSync(appsJsonPath, 'utf-8'));

// Public website files that get compiled and published
const PUBLIC_WEB_FILES = [
  'index.html',
  'src/data/apps.json',
  'src/main.js',
  'src/style.css',
];

/**
 * One-way SHA-256 cryptographic fingerprints of restricted tokens.
 * Storing only one-way hashes ensures the repository itself never reveals
 * which words or internal names are on the blocklist.
 */
const RESTRICTED_TOKEN_HASHES = new Set([
  'fa232a37422cbbaa3907745ed1906d4fa5884733737b0170779bb26cd7e42dc4',
  '0bcd728f4324a803a8a8fa7aa944cc1652e36678db4f96fd0a2384d6e2ad40c6',
  '980c4bd6a677da0511813adb8c98192e8a8103c325e5d183f1dadb569e737dcf',
  '0d0aabdad238b70b1117fb88df9cb217d2c4e14eaf642345cb5ad0585da54732',
  'a3e674715e5978780e0b609f67029e99e9f13a3d241034f8170e288fdbc451cc',
  '88500e2a216ae663bf5bc3807718303cb93d928233c16243e8ebaef149dc0fa7',
  'eab762a03fd979a04cc4706e6536d382bc89d2d1356afcd054a16b2235ecd471',
  'fed0e4820af42571c936e28300ccb88026f72e075232358cd1fae4e802fe902b',
  '6fe8ecbc1deafa51c2ecf088cf364eba1ceba9032ffbe2621e771b90ea93153d',
  '2a31aefa266db9cca794ee878f884a57bf190075ae0ed167b65b43e558b596ab',
  'fe14010b4fe83303852f0467c919ef9a7ca089b91e96e3aad7d426dd87079297',
  '1ffc0406b9891fcd265a225e83a668fa045f1282588f80c8d11c029bad156d85',
  '60f91a742458ae606572f40dd7df0a128e554acb023f6989fe5148872648fc56',
  'd548c5b83fa61d8e3bd86ad42a7ffea9b7c86e3f9d8095c1577d3e1270bb9420',
  'caf90169eefa5f807d577486b9f795ab86ae2983c5c20806cff959117e90af18',
  '738e22f0acab814cc0c6a9dfdd1c6a193ea278e48b07f070784d608243e68d8c',
  'fc8932c70118a71ec5bea4af7733dd1c2087442469a532d599a5fdaf076ab8a0',
  '94a35fdc30df7d129a447217f9ffade7e4917bdcc90460d7db2f0460c08c0e06',
  '795b104abe3e4134960ca245ded0e617f162c751209347b7f003bc35e062f43e',
  '4ff74fee4b291f59e0b1cd0a1b95896d08600e87126221fe3d21dcb168a6d323',
  '7398be5fd80dda8b544b96192b2d620be341a6fa6ec1d92a1ed26b04d5e4c142',
  'a3863c5d7ce546d24186581bcba0b0a157db9d318d9174d46d0db3f3f38cc1a6',
  '5be1ecc7935f1dd85635d4feedaf660594030253cc97c9e9ca3819ffeac36b65',
  'd6e0ff2b7a534a9750d13545971476557164f72cb92ad74be7f145491ec4acf4',
  '858bd5f51000cf273d4de32ef14ac9c5887cce3076ab8f8f1b2e30fd499afab6',
  '7804a56a5c7636cc05814736f44139e32920810d3bd51aa099a5df932e754ce9',
  '81d93757457f988523814ae0009837ae893f38d3fe123f2c37896f118b4c7804',
  '8c94e71421a61d719c92e212b7160ec39178c0ac50a4880356400f95f0dafc6f',
  '49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763',
]);

function sha256(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

describe('Zero-Disclosure Content & URL Guardrails', () => {
  it('verifies no restricted tokens appear in any public website files', () => {
    for (const relPath of PUBLIC_WEB_FILES) {
      const fullPath = path.join(ROOT_DIR, relPath);
      const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
      const tokens = content.match(/[a-z0-9_-]{3,}/g) || [];

      for (const token of tokens) {
        expect(
          RESTRICTED_TOKEN_HASHES.has(sha256(token)),
          `Restricted token detected in ${relPath}: "${token}"`
        ).toBe(false);
      }
    }
  });

  it('verifies no RFC1918 private IPv4 addresses appear in any public website files', () => {
    const privateIpRegex =
      /\b(?:127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})\b/;

    for (const relPath of PUBLIC_WEB_FILES) {
      const fullPath = path.join(ROOT_DIR, relPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(privateIpRegex.test(content), `Private IP detected in ${relPath}`).toBe(false);
    }
  });

  it('validates that all published liveApps use HTTPS, elliotrunsontech.com subdomains, and zero raw ports', () => {
    expect(Array.isArray(appsData.liveApps)).toBe(true);
    expect(appsData.liveApps.length).toBeGreaterThan(0);

    for (const app of appsData.liveApps) {
      const parsed = new URL(app.url);
      expect(parsed.protocol).toBe('https:');
      expect(parsed.port).toBe('');
      expect(
        parsed.hostname === 'elliotrunsontech.com' ||
          parsed.hostname.endsWith('.elliotrunsontech.com')
      ).toBe(true);
    }
  });

  it('verifies that .gitignore protects .env secrets and local notes', () => {
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignoreContent).toContain('.env');
    expect(gitignoreContent).toContain('local-only-server-notes/');
  });
});
