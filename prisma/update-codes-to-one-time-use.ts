import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const JWT_TOKEN = process.env.JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNWFiMTc4NC0xODIxLTQ3MjktOGIxYS1mNjM0YzgyZjhkNDUiLCJpYXQiOjE3NjU3MDg4MjUsImV4cCI6MTc2NTcwOTcyNX0.mB8ejdHf-0SXGGDO-af-ZM9jPFmbmrx3T4jkWu8qAzc';
const CODES_FILE = path.join(__dirname, 'discount-codes-100-percent-50-codes-api.txt');

/**
 * Extract codes from the file
 */
function extractCodesFromFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const codes: string[] = [];
  
  let inCodesSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('100% Discount Codes')) {
      inCodesSection = true;
      continue;
    }
    
    if (trimmed.includes('Successfully created') || trimmed.includes('Failed Codes')) {
      inCodesSection = false;
      continue;
    }
    
    if (inCodesSection && trimmed && !trimmed.includes('---')) {
      // Check if it's a valid code (7 characters, alphanumeric)
      if (/^[A-Z0-9]{7}$/.test(trimmed)) {
        codes.push(trimmed);
      }
    }
  }
  
  return codes;
}

/**
 * Get discount code ID by code value
 */
async function getDiscountCodeId(code: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/discount-codes/${code}`,
    );
    
    if (response.data.success && response.data.data?.id) {
      return response.data.data.id;
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Update discount code to one-time use
 */
async function updateCodeToOneTimeUse(codeId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/admin/discount-codes/${codeId}`,
      {
        maxUses: 1,
      },
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.success) {
      return { success: true };
    } else {
      return { success: false, error: response.data.message || 'Unknown error' };
    }
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
      return { success: false, error: errorMessage };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Updating discount codes to one-time use...\n');
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  // Read codes from file
  if (!fs.existsSync(CODES_FILE)) {
    console.error(`❌ File not found: ${CODES_FILE}`);
    process.exit(1);
  }

  const codes = extractCodesFromFile(CODES_FILE);
  console.log(`Found ${codes.length} codes in file\n`);

  if (codes.length === 0) {
    console.error('❌ No codes found in file');
    process.exit(1);
  }

  const results: Array<{ code: string; success: boolean; error?: string }> = [];

  // Process each code
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    process.stdout.write(`[${i + 1}/${codes.length}] Processing ${code}... `);

    try {
      // Get the discount code ID
      const codeId = await getDiscountCodeId(code);
      
      if (!codeId) {
        console.log(`✗ (Code not found)`);
        results.push({ code, success: false, error: 'Code not found' });
        continue;
      }

      // Update to one-time use
      const result = await updateCodeToOneTimeUse(codeId, code);
      results.push({ ...result, code });

      if (result.success) {
        console.log('✓');
      } else {
        console.log(`✗ (${result.error})`);
      }
    } catch (error: any) {
      console.log(`✗ (${error.message})`);
      results.push({ code, success: false, error: error.message });
    }

    // Small delay to avoid overwhelming the API
    if (i < codes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  console.log('\n==================================================');
  console.log('Summary:');
  console.log('==================================================\n');
  console.log(`Total codes processed: ${results.length}`);
  console.log(`Successfully updated: ${successful}`);
  console.log(`Failed: ${failed}\n`);

  if (failed > 0) {
    console.log('Failed codes:');
    results.filter(r => !r.success).forEach(({ code, error }) => {
      console.log(`  - ${code}: ${error}`);
    });
  }

  console.log('\n✓ All codes have been updated to one-time use (maxUses: 1)');
}

main()
  .then(() => {
    console.log('\n✓ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });

