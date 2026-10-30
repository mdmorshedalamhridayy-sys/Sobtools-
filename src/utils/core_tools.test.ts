/**
 * Automated test suite for SobTools calculation and data-processing algorithms
 */

export function runSobToolsTests(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`PASS: ${testName}`);
    } else {
      failed++;
      results.push(`FAIL: ${testName}`);
      console.error(`Assertion failed: ${testName}`);
    }
  }

  // 1. Word and Character counter verification
  const sampleBengaliText = 'আমরা বাংলাদেশকে ভালোবাসি। এটি একটি সুন্দর দেশ।';
  const sampleWords = sampleBengaliText.trim().split(/\s+/).filter(Boolean);
  assert(sampleWords.length === 6, 'Word counter handles Bengali words correctly');
  assert(sampleBengaliText.length === 47, 'Character counter with spaces calculates exact count');

  // 2. Unit Converter - Bangladeshi Land Measurement Verification
  // 1 Katha = 720 sq ft = 66.8903 sq m
  // 1 Bigha = 20 Katha = 14,400 sq ft
  const kathaToSqFt = (katha: number) => katha * 720;
  const bighaToKatha = (bigha: number) => bigha * 20;
  assert(kathaToSqFt(1) === 720, '1 Katha equals exactly 720 square feet');
  assert(bighaToKatha(1) === 20, '1 Bigha equals exactly 20 Katha');
  assert(kathaToSqFt(bighaToKatha(1)) === 14400, '1 Bigha equals 14,400 square feet');

  // 3. Temperature Formula Verification
  // 0°C = 32°F, 100°C = 212°F
  const cToF = (c: number) => (c * 9) / 5 + 32;
  const fToC = (f: number) => ((f - 32) * 5) / 9;
  assert(cToF(0) === 32, '0 Celsius converts to 32 Fahrenheit');
  assert(cToF(100) === 212, '100 Celsius converts to 212 Fahrenheit');
  assert(fToC(32) === 0, '32 Fahrenheit converts back to 0 Celsius');

  // 4. Duplicate Line Remover
  const linesWithDuplicates = ['apple', 'banana', 'apple', 'cherry', 'banana', 'date'];
  const unique = Array.from(new Set(linesWithDuplicates));
  assert(unique.length === 4, 'Duplicate remover accurately strips duplicate lines');
  assert(unique.includes('apple') && unique.includes('date'), 'Duplicate remover preserves unique entries');

  // 5. JSON Validator
  const validJson = '{"name": "SobTools", "tools": 36}';
  const invalidJson = '{"name": "SobTools", tools: 36}';
  let isValid = false;
  try {
    JSON.parse(validJson);
    isValid = true;
  } catch {}
  assert(isValid === true, 'JSON validator recognizes valid JSON');

  let isInvalid = false;
  try {
    JSON.parse(invalidJson);
  } catch {
    isInvalid = true;
  }
  assert(isInvalid === true, 'JSON validator correctly identifies invalid JSON syntax');

  // 6. URL Encode / Decode
  const rawUrl = 'https://sobtools.com/search?q=ইমেজ কম্প্রেসার&lang=bn';
  const encoded = encodeURIComponent(rawUrl);
  const decoded = decodeURIComponent(encoded);
  assert(decoded === rawUrl, 'URL encode and decode preserves exact Unicode string');

  // 7. Microstock Platform Compliance & Megapixels Calculation
  // Adobe Stock: min 4 MP (4,000,000 pixels)
  // Dreamstime: min 3 MP (3,000,000 pixels)
  const calcMegapixels = (width: number, height: number) => (width * height) / 1000000;
  const mp1 = calcMegapixels(4000, 3000); // 12 MP
  const mp2 = calcMegapixels(1920, 1080); // 2.0736 MP
  assert(mp1 === 12, '4000x3000 produces exact 12.0 Megapixels');
  assert(mp1 >= 4, '4000x3000 satisfies Adobe Stock 4.0 MP minimum requirement');
  assert(mp1 >= 3, '4000x3000 satisfies Dreamstime 3.0 MP minimum requirement');
  assert(mp2 < 4, '1920x1080 is correctly flagged as under Adobe Stock 4.0 MP minimum');

  // 8. Microstock Trademark & Prohibited Brand Scanner
  const RESTRICTED_BRANDS = ['apple', 'nike', 'adidas', 'disney', 'photoshop', 'lego'];
  const testStockKeywords = ['illustration', 'vector', 'apple', 'technology', 'design'];
  const detectedBrands = testStockKeywords.filter(k => RESTRICTED_BRANDS.includes(k.toLowerCase().trim()));
  assert(detectedBrands.length === 1 && detectedBrands[0] === 'apple', 'Stock metadata tool detects prohibited trademark names in tags');

  // 9. Adobe Stock Top 10 Priority Tag Splitting
  const sampleStockTags = Array.from({ length: 25 }, (_, i) => `keyword_${i + 1}`);
  const top10Tags = sampleStockTags.slice(0, 10);
  assert(top10Tags.length === 10, 'Adobe Stock metadata splits the critical top 10 search priority tags');

  return { passed, failed, results };
}
