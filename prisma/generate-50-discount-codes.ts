import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = 'http://localhost:3001/api/v1/admin/discount-codes';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOWY2NWUyZi1iZjA4LTRjMWYtODMwMS1jNWQ3ZWMwNDU4YWYiLCJpYXQiOjE3NjUwODg3MTMsImV4cCI6MTc2NTA4OTYxM30.jBP4r8IRFzZXe__V0LOOTVfm3jwfU5YHGCVEnbg8Bb4';

// Generate random 7-character code (alphanumeric, uppercase)
function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
  const percentage = 50;
  const count = 50;
  const description = '50% one-time discount';

  const output: string[] = [];
  output.push('Generated Discount Codes');
  output.push('='.repeat(50));
  output.push(`Generated at: ${new Date().toISOString()}`);
  output.push('');

  output.push(`\n${percentage}% Discount Codes (${count} codes):`);
  output.push('-'.repeat(50));

  const codes: string[] = [];
  const failedCodes: Array<{ code: string; error: string }> = [];

  for (let i = 0; i < count; i++) {
    let code = generateRandomCode();
    let attempts = 0;
    let result;

    // Retry if code already exists (unlikely but possible)
    do {
      result = await createDiscountCode(code, percentage, description);
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
      process.stdout.write(`✓ Created ${percentage}% code: ${result.code} (${i + 1}/${count})\n`);
    } else {
      failedCodes.push({ code: result.code, error: result.error || 'Unknown error' });
      process.stdout.write(`✗ Failed to create code: ${result.code} - ${result.error}\n`);
    }

    // Small delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  output.push('');
  output.push(`Successfully created: ${codes.length}/${count}`);
  if (failedCodes.length > 0) {
    output.push(`Failed codes:`);
    failedCodes.forEach((fc) => {
      output.push(`  - ${fc.code}: ${fc.error}`);
    });
  }

  // Write to file
  const outputPath = path.join(__dirname, 'discount-codes-50-percent-50-codes.txt');
  fs.writeFileSync(outputPath, output.join('\n'), 'utf-8');

  console.log(`\n✓ All codes written to: ${outputPath}`);
  console.log(`✓ Total codes created: ${codes.length}/${count}`);
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

