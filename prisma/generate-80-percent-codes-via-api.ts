import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const JWT_TOKEN = process.env.JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNWFiMTc4NC0xODIxLTQ3MjktOGIxYS1mNjM0YzgyZjhkNDUiLCJpYXQiOjE3NjU3ODg2NjUsImV4cCI6MTc2NTc4OTU2NX0.RPtlipOQl5L5utGzdEFvNA2EOJfBV-cfI2S_jCzc2-8';
const DISCOUNT_PERCENTAGE = 80;
const CODE_COUNT = 100;

/**
 * Generate a random 7-character alphanumeric code (uppercase)
 */
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate unique discount codes
 */
function generateUniqueCodes(count: number, existingCodes: Set<string>): string[] {
  const codes: string[] = [];
  let attempts = 0;
  const maxAttempts = count * 10; // Safety limit

  while (codes.length < count && attempts < maxAttempts) {
    const code = generateCode();

    // Check if code already exists
    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code);
      existingCodes.add(code);
    }
    attempts++;
  }

  if (codes.length < count) {
    throw new Error(
      `Failed to generate ${count} unique codes after ${maxAttempts} attempts. Generated ${codes.length} codes.`,
    );
  }

  return codes;
}

/**
 * Create discount code via API
 */
async function createDiscountCodeViaAPI(code: string): Promise<{ success: boolean; code: string; error?: string }> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/admin/discount-codes`,
      {
        code: code,
        discountType: 'PERCENTAGE',
        discountValue: DISCOUNT_PERCENTAGE,
      },
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.success) {
      return { success: true, code };
    } else {
      return { success: false, code, error: response.data.message || 'Unknown error' };
    }
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
      return { success: false, code, error: errorMessage };
    }
    return { success: false, code, error: error.message };
  }
}

/**
 * Format output for file
 */
function formatOutput(codes: Array<{ code: string; success: boolean }>): string {
  const timestamp = new Date().toISOString();
  const successfulCodes = codes.filter(c => c.success).map(c => c.code);
  const failedCodes = codes.filter(c => !c.success);

  let output = 'Generated Discount Codes via API\n';
  output += '==================================================\n';
  output += `Generated at: ${timestamp}\n\n\n`;

  output += `${DISCOUNT_PERCENTAGE}% Discount Codes (${successfulCodes.length} codes):\n`;
  output += '--------------------------------------------------\n';
  successfulCodes.forEach((code) => {
    output += `${code}\n`;
  });
  output += '\n';

  if (failedCodes.length > 0) {
    output += `Failed Codes (${failedCodes.length}):\n`;
    output += '--------------------------------------------------\n';
    failedCodes.forEach(({ code, success }) => {
      output += `${code} - Failed\n`;
    });
    output += '\n';
  }

  output += `Successfully created: ${successfulCodes.length}/${codes.length}\n`;

  return output;
}

/**
 * Main function
 */
async function main() {
  console.log(`Generating ${CODE_COUNT} discount codes at ${DISCOUNT_PERCENTAGE}% via API...\n`);
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  // Get existing codes from database via API to avoid duplicates
  let existingCodes = new Set<string>();
  try {
    console.log('Fetching existing discount codes...');
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/discount-codes`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
      },
    );

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((dc: any) => {
        existingCodes.add(dc.code);
      });
      console.log(`✓ Found ${existingCodes.size} existing codes\n`);
    }
  } catch (error: any) {
    console.warn(`⚠ Warning: Could not fetch existing codes: ${error.message}`);
    console.warn('Continuing anyway...\n');
  }

  // Generate unique codes
  console.log(`Generating ${CODE_COUNT} unique codes...`);
  const codes = generateUniqueCodes(CODE_COUNT, existingCodes);
  console.log(`✓ Generated ${codes.length} unique codes\n`);

  // Create codes via API
  console.log('Creating discount codes via API...\n');
  const results: Array<{ code: string; success: boolean; error?: string }> = [];

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    process.stdout.write(`[${i + 1}/${codes.length}] Creating ${code}... `);

    const result = await createDiscountCodeViaAPI(code);
    results.push(result);

    if (result.success) {
      console.log('✓');
    } else {
      console.log(`✗ (${result.error})`);
    }

    // Small delay to avoid overwhelming the API
    if (i < codes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Format and save to file
  const successfulCodes = results.filter(r => r.success).map(r => r.code);
  const output = formatOutput(results);
  const filePath = path.join(__dirname, `discount-codes-${DISCOUNT_PERCENTAGE}-percent-${CODE_COUNT}-codes-api.txt`);
  fs.writeFileSync(filePath, output, 'utf-8');

  console.log('\n==================================================');
  console.log('Summary:');
  console.log('==================================================\n');
  console.log(`Total codes generated: ${codes.length}`);
  console.log(`Successfully created: ${successfulCodes.length}`);
  console.log(`Failed: ${results.length - successfulCodes.length}`);
  console.log(`\n✓ Output saved to: ${filePath}\n`);

  if (successfulCodes.length > 0) {
    console.log('Successfully created codes:');
    successfulCodes.forEach((code, index) => {
      console.log(`  ${index + 1}. ${code}`);
    });
  }
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

