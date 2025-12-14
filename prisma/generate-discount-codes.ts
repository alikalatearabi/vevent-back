import { PrismaClient, DiscountType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
async function generateDiscountCodes(
  discountPercentage: number,
  count: number,
): Promise<string[]> {
  const codes: string[] = [];
  const existingCodes = new Set<string>();

  // Get all existing codes to avoid duplicates
  const allExisting = await prisma.discountCode.findMany({
    select: { code: true },
  });
  allExisting.forEach((dc) => existingCodes.add(dc.code));

  let attempts = 0;
  const maxAttempts = count * 10; // Safety limit

  while (codes.length < count && attempts < maxAttempts) {
    const code = generateCode();

    // Check if code already exists (in our new codes or database)
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
 * Create discount codes in database and return created codes
 */
async function createDiscountCodes(
  discountPercentage: number,
  codes: string[],
): Promise<string[]> {
  const createdCodes: string[] = [];

  for (const code of codes) {
    try {
      await prisma.discountCode.create({
        data: {
          code: code.toUpperCase(),
          discountType: DiscountType.PERCENTAGE,
          discountValue: discountPercentage,
          isActive: true,
          currentUses: 0,
        },
      });
      createdCodes.push(code);
    } catch (error: any) {
      // If code already exists, skip it
      if (error.code === 'P2002') {
        console.warn(`Code ${code} already exists, skipping...`);
        continue;
      }
      throw error;
    }
  }

  return createdCodes;
}

/**
 * Format codes for output file
 */
function formatOutput(
  percentage40Codes: string[],
  percentage35Codes: string[],
): string {
  const timestamp = new Date().toISOString();
  let output = 'Generated Discount Codes\n';
  output += '==================================================\n';
  output += `Generated at: ${timestamp}\n\n\n`;

  // 40% codes
  output += `40% Discount Codes (${percentage40Codes.length} codes):\n`;
  output += '--------------------------------------------------\n';
  percentage40Codes.forEach((code) => {
    output += `${code}\n`;
  });
  output += '\n';

  // 35% codes
  output += `35% Discount Codes (${percentage35Codes.length} codes):\n`;
  output += '--------------------------------------------------\n';
  percentage35Codes.forEach((code) => {
    output += `${code}\n`;
  });
  output += '\n';

  output += `Successfully created: ${percentage40Codes.length + percentage35Codes.length}/${percentage40Codes.length + percentage35Codes.length}\n`;

  return output;
}

/**
 * Main function
 */
async function main() {
  console.log('Generating discount codes...\n');

  try {
    // Generate 100 codes for 40%
    console.log('Generating 100 codes for 40% discount...');
    const codes40 = await generateDiscountCodes(40, 100);
    console.log(`✓ Generated ${codes40.length} unique codes for 40%`);

    // Generate 100 codes for 35%
    console.log('Generating 100 codes for 35% discount...');
    const codes35 = await generateDiscountCodes(35, 100);
    console.log(`✓ Generated ${codes35.length} unique codes for 35%`);

    // Create codes in database
    console.log('\nCreating 40% discount codes in database...');
    const created40 = await createDiscountCodes(40, codes40);
    console.log(`✓ Created ${created40.length} codes for 40%`);

    console.log('Creating 35% discount codes in database...');
    const created35 = await createDiscountCodes(35, codes35);
    console.log(`✓ Created ${created35.length} codes for 35%`);

    // Format and save to file
    const output = formatOutput(created40, created35);
    const filePath = path.join(__dirname, 'discount-codes-40-35-percent.txt');
    fs.writeFileSync(filePath, output, 'utf-8');

    console.log(`\n✓ Output saved to: ${filePath}`);
    console.log(`\nTotal codes created: ${created40.length + created35.length}`);
    console.log(`  - 40%: ${created40.length} codes`);
    console.log(`  - 35%: ${created35.length} codes`);
  } catch (error) {
    console.error('\n✗ Error:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✓ Process completed successfully');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n✗ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

