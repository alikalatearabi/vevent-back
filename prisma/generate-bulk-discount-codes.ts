import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = 'http://localhost:3001/api/v1/admin/discount-codes';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNWFiMTc4NC0xODIxLTQ3MjktOGIxYS1mNjM0YzgyZjhkNDUiLCJpYXQiOjE3NjUwMDg1NjMsImV4cCI6MTc2NTAwOTQ2M30.AJiDQCzE5cbF3hxVKvEFq-9AF4xCBvpoieSZC7qJoNQ';

// Generate random 7-character code (alphanumeric, uppercase)
function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface DiscountCodeConfig {
  percentage: number;
  count: number;
  description: string;
}

const configs: DiscountCodeConfig[] = [
  { percentage: 70, count: 40, description: '70% one-time discount' },
  { percentage: 60, count: 40, description: '60% one-time discount' },
  { percentage: 50, count: 40, description: '50% one-time discount' },
  { percentage: 100, count: 40, description: '100% one-time discount' },
];

async function createDiscountCode(
  code: string,
  percentage: number,
  description: string,
): Promise<{ success: boolean; code: string; error?: string }> {
  try {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiration

    const response = await axios.post(
      API_BASE_URL,
      {
        code,
        discountType: 'PERCENTAGE',
        discountValue: percentage,
        expiresAt: expiresAt.toISOString(),
        maxUses: 1, // One-time use
        singleUsePerUser: true,
        description,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
      },
    );

    return { success: true, code };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    return { success: false, code, error: errorMessage };
  }
}

async function generateBulkCodes() {
  const output: string[] = [];
  output.push('Generated Discount Codes');
  output.push('='.repeat(50));
  output.push(`Generated at: ${new Date().toISOString()}`);
  output.push('');

  for (const config of configs) {
    output.push(`\n${config.percentage}% Discount Codes (${config.count} codes):`);
    output.push('-'.repeat(50));

    const codes: string[] = [];
    const failedCodes: Array<{ code: string; error: string }> = [];

    for (let i = 0; i < config.count; i++) {
      let code = generateRandomCode();
      let attempts = 0;
      let result;

      // Retry if code already exists (unlikely but possible)
      do {
        result = await createDiscountCode(code, config.percentage, config.description);
        if (!result.success && result.error?.includes('قبلاً ثبت شده')) {
          code = generateRandomCode();
          attempts++;
        } else {
          break;
        }
      } while (attempts < 5);

      if (result.success) {
        codes.push(result.code);
        output.push(result.code);
        process.stdout.write(`✓ Created ${config.percentage}% code: ${result.code}\n`);
      } else {
        failedCodes.push({ code: result.code, error: result.error || 'Unknown error' });
        process.stdout.write(`✗ Failed to create code: ${result.code} - ${result.error}\n`);
      }

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    output.push('');
    output.push(`Successfully created: ${codes.length}/${config.count}`);
    if (failedCodes.length > 0) {
      output.push(`Failed codes:`);
      failedCodes.forEach((fc) => {
        output.push(`  - ${fc.code}: ${fc.error}`);
      });
    }
  }

  // Write to file
  const outputPath = path.join(__dirname, 'discount-codes-output.txt');
  fs.writeFileSync(outputPath, output.join('\n'), 'utf-8');

  console.log(`\n✓ All codes written to: ${outputPath}`);
}

// Run the script
generateBulkCodes()
  .then(() => {
    console.log('\n✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });

