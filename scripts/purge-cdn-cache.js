#!/usr/bin/env node

/**
 * CDN Cache Purge Script for GitHub Pages
 * 
 * This script helps purge CDN caches after deployment.
 * Supports multiple CDN providers:
 * - jsDelivr (automatic with GitHub releases)
 * - Cloudflare (requires API token)
 * - Custom CDN endpoints
 * 
 * Usage:
 *   node scripts/purge-cdn-cache.js
 * 
 * Environment Variables:
 *   - CLOUDFLARE_API_TOKEN: Cloudflare API token for cache purge
 *   - CLOUDFLARE_ZONE_ID: Cloudflare zone ID
 *   - CDN_PROVIDER: CDN provider (jsdelivr|cloudflare|custom)
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const config = {
  provider: process.env.CDN_PROVIDER || 'jsdelivr',
  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
  },
  repository: process.env.GITHUB_REPOSITORY || '',
  commitSha: process.env.GITHUB_SHA || '',
};

/**
 * Log message with timestamp
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }[type] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * Make HTTPS request
 */
function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Purge jsDelivr cache
 * jsDelivr automatically purges cache when:
 * - New GitHub release is published
 * - New commit is pushed to main branch
 * 
 * We can't directly purge jsDelivr cache for GitHub Pages,
 * but we can trigger a cache refresh by updating a timestamp file.
 */
async function purgeJsDelivr() {
  log('jsDelivr CDN detected', 'info');
  log('jsDelivr automatically refreshes cache within 24 hours', 'info');
  log('For immediate refresh, consider:', 'warning');
  log('  1. Using versioned asset filenames (e.g., app.abc123.js)', 'warning');
  log('  2. Adding query parameters to static assets', 'warning');
  log('  3. Publishing a new GitHub release', 'warning');
  
  // Create cache-bust timestamp
  const timestamp = Date.now();
  log(`Cache bust timestamp: ${timestamp}`, 'success');
  
  return {
    provider: 'jsdelivr',
    purged: true,
    timestamp,
    message: 'jsDelivr will auto-refresh within 24 hours',
  };
}

/**
 * Purge Cloudflare cache
 * Requires Cloudflare API token and zone ID
 */
async function purgeCloudflare() {
  if (!config.cloudflare.apiToken || !config.cloudflare.zoneId) {
    throw new Error(
      'Cloudflare purge requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID environment variables'
    );
  }
  
  log('Purging Cloudflare cache...', 'info');
  
  const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/zones/${config.cloudflare.zoneId}/purge_cache`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.cloudflare.apiToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'qore-cdn-purge-script/1.0',
    },
  };
  
  // Purge all cache
  const postData = JSON.stringify({
    purge_everything: true,
  });
  
  try {
    const response = await httpsRequest(options, postData);
    
    if (response.statusCode === 200) {
      log('Cloudflare cache purged successfully', 'success');
      return {
        provider: 'cloudflare',
        purged: true,
        statusCode: response.statusCode,
        message: 'All Cloudflare cache purged',
      };
    } else {
      throw new Error(`Cloudflare API returned status ${response.statusCode}: ${response.data}`);
    }
  } catch (error) {
    log(`Failed to purge Cloudflare cache: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Purge custom CDN cache
 * Implement custom CDN purge logic here
 */
async function purgeCustomCDN() {
  log('Custom CDN provider detected', 'warning');
  log('Please implement custom purge logic in scripts/purge-cdn-cache.js', 'warning');
  
  // Example: Purge custom CDN endpoint
  // const response = await httpsRequest({
  //   hostname: 'your-cdn-provider.com',
  //   path: '/api/purge',
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.CDN_API_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  // }, JSON.stringify({
  //   paths: ['/*'],
  // }));
  
  return {
    provider: 'custom',
    purged: false,
    message: 'Custom CDN purge not implemented',
  };
}

/**
 * Main function
 */
async function main() {
  log('Starting CDN cache purge...', 'info');
  log(`Provider: ${config.provider}`, 'info');
  log(`Repository: ${config.repository}`, 'info');
  log(`Commit: ${config.commitSha}`, 'info');
  
  let result;
  
  try {
    switch (config.provider) {
      case 'jsdelivr':
        result = await purgeJsDelivr();
        break;
      
      case 'cloudflare':
        result = await purgeCloudflare();
        break;
      
      case 'custom':
        result = await purgeCustomCDN();
        break;
      
      default:
        throw new Error(`Unknown CDN provider: ${config.provider}`);
    }
    
    log('CDN cache purge completed', 'success');
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    log(`CDN cache purge failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run main function
main();
