// Simple test to verify platform mapping works
const { getPlatformAndPolicyFromUrl } = require('./lib/allowed-platforms.ts');

console.log('Testing platform mapping...');

const testUrls = [
  'https://v.douyin.com/ieFsj2Rf/',
  'https://www.iesdouyin.com/share/video/123',
  'https://douyin.com/video/456',
  'https://www.youtube.com/watch?v=123',
  'https://youtu.be/456',
  'https://b23.tv/BV123',
  'https://www.bilibili.com/video/BV456',
  'https://example.com/unsupported'
];

testUrls.forEach(url => {
  const { platform, policy } = getPlatformAndPolicyFromUrl(url);
  console.log(`URL: ${url}`);
  console.log(`  Platform: ${platform}`);
  console.log(`  Policy: allowDownload=${policy.allowDownload}, allowMetadata=${policy.allowMetadata}`);
  console.log('');
});

console.log('Platform mapping test complete.');

module.exports = { testUrls };