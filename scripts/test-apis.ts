/**
 * EventPilot AI - Phase 1: API Smoke Tests
 * Tests all external API connections with fallback detection
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface TestResult {
  service: string;
  status: 'PASS' | 'FAIL' | 'FALLBACK_REQUIRED';
  message: string;
  timestamp: string;
}

const results: TestResult[] = [];

// Test 1: Cala API
async function testCalaAPI(): Promise<TestResult> {
  const service = 'Cala API (Cost/Legal Intelligence)';
  console.log(`\n🔍 Testing ${service}...`);
  
  try {
    const response = await fetch('https://api.cala.ai/v1/knowledge/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.CALA_API_KEY || '',
      },
      body: JSON.stringify({
        input: 'event.type=corporate.location=Spain'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        service,
        status: 'PASS',
        message: `✅ Connected successfully. Response received.`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service,
        status: 'FALLBACK_REQUIRED',
        message: `⚠️  API returned ${response.status}. Fallback to static cost data required.`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service,
      status: 'FALLBACK_REQUIRED',
      message: `⚠️  Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback required.`,
      timestamp: new Date().toISOString()
    };
  }
}

// Test 2: Vapi API
async function testVapiAPI(): Promise<TestResult> {
  const service = 'Vapi (Voice AI)';
  console.log(`\n🔍 Testing ${service}...`);
  
  try {
    // Test with a simple API call to check authentication
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PUBLIC_API_KEY}`,
      }
    });

    if (response.ok || response.status === 404) {
      // 404 is acceptable - means auth worked but no assistants yet
      return {
        service,
        status: 'PASS',
        message: `✅ Connected successfully. API key valid.`,
        timestamp: new Date().toISOString()
      };
    } else if (response.status === 401) {
      return {
        service,
        status: 'FALLBACK_REQUIRED',
        message: `⚠️  Authentication failed. Check API key. Fallback to text-only intake required.`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service,
        status: 'FALLBACK_REQUIRED',
        message: `⚠️  API returned ${response.status}. Fallback required.`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service,
      status: 'FALLBACK_REQUIRED',
      message: `⚠️  Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback to text-only required.`,
      timestamp: new Date().toISOString()
    };
  }
}

// Test 3: PixVerse API
async function testPixVerseAPI(): Promise<TestResult> {
  const service = 'PixVerse AI (Image/Video Generation)';
  console.log(`\n🔍 Testing ${service}...`);
  
  try {
    // Test API connectivity - adjust endpoint based on actual PixVerse API docs
    const response = await fetch('https://api.pixverse.ai/v1/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PIXVERSE_API_KEY}`,
      }
    });

    if (response.ok) {
      return {
        service,
        status: 'PASS',
        message: `✅ Connected successfully. API key valid.`,
        timestamp: new Date().toISOString()
      };
    } else if (response.status === 401) {
      return {
        service,
        status: 'FALLBACK_REQUIRED',
        message: `⚠️  Authentication failed. Fallback to static template images required.`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service,
        status: 'FALLBACK_REQUIRED',
        message: `⚠️  API returned ${response.status}. Fallback to static templates required.`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service,
      status: 'FALLBACK_REQUIRED',
      message: `⚠️  Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback to static templates required.`,
      timestamp: new Date().toISOString()
    };
  }
}

// Test 4: Weather API (Open-Meteo - no auth required)
async function testWeatherAPI(): Promise<TestResult> {
  const service = 'Open-Meteo (Weather Forecast)';
  console.log(`\n🔍 Testing ${service}...`);
  
  try {
    // Test with a sample location (Madrid, Spain)
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=temperature_2m,weather_code&timezone=auto'
    );

    if (response.ok) {
      const data = await response.json();
      return {
        service,
        status: 'PASS',
        message: `✅ Connected successfully. Current temp: ${data.current?.temperature_2m}°C`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        service,
        status: 'FALLBACK_REQUIRED',
        message: `⚠️  API returned ${response.status}. Fallback to seasonal averages required.`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      service,
      status: 'FALLBACK_REQUIRED',
      message: `⚠️  Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback to seasonal averages required.`,
      timestamp: new Date().toISOString()
    };
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  EventPilot AI - Phase 1: API Smoke Tests');
  console.log('═══════════════════════════════════════════════════════');
  
  results.push(await testCalaAPI());
  results.push(await testVapiAPI());
  results.push(await testPixVerseAPI());
  results.push(await testWeatherAPI());
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let passCount = 0;
  let fallbackCount = 0;
  let failCount = 0;
  
  results.forEach(result => {
    console.log(`${result.service}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  ${result.message}`);
    console.log('');
    
    if (result.status === 'PASS') passCount++;
    else if (result.status === 'FALLBACK_REQUIRED') fallbackCount++;
    else failCount++;
  });
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ PASS: ${passCount} | ⚠️  FALLBACK: ${fallbackCount} | ❌ FAIL: ${failCount}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (fallbackCount > 0) {
    console.log('⚠️  WARNING: Some APIs require fallback mode.');
    console.log('   The demo will work, but with mock/cached data for failed services.\n');
  }
  
  if (passCount === results.length) {
    console.log('🎉 All systems operational! Ready to proceed with Phase 2.\n');
  }
}

// Execute
runAllTests().catch(console.error);

// Made with Bob
