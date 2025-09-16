// Simple test for URL extraction functionality
const { extractUrlFromShareText, isAllowedHost, detectPlatform, isPlatformDownloadAllowed } = require('./lib/url-normalize.ts');

// Test cases
const testCases = [
  // 抖音分享文案
  '7.43 复制打开抖音，看看【用户名】的作品 https://v.douyin.com/ieFsj2Rf/',
  
  // B站分享
  '【视频标题】 https://b23.tv/BV1234567890',
  
  // YouTube短链
  'Check out this video: https://youtu.be/dQw4w9WgXcQ',
  
  // 直接链接
  'https://www.bilibili.com/video/BV1234567890',
  
  // 含中文标点
  '看这个视频！https://v.douyin.com/abc123！！！',
  
  // 无链接文本
  '这是一段没有链接的文字',
  
  // 多个链接（应该提取第一个）
  'First: https://v.douyin.com/first Second: https://youtube.com/second'
];

console.log('Testing URL extraction:');
console.log('======================');

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase}`);
  
  const extracted = extractUrlFromShareText(testCase);
  console.log(`Extracted: ${extracted}`);
  
  if (extracted) {
    console.log(`Allowed host: ${isAllowedHost(extracted)}`);
    console.log(`Platform: ${detectPlatform(extracted)}`);
    console.log(`Download allowed: ${isPlatformDownloadAllowed(detectPlatform(extracted))}`);
  }
});

module.exports = { testCases };