import { calculateStatusAndDays } from './utils/membershipHelper.js';

console.log('--------------------------------------------------');
console.log('RUNNING SYSTEM CALCULATION SANITY TEST...');
console.log('--------------------------------------------------');

// Define tests
const today = new Date();

// Test case 1: Expiry date 15 days in future (Expected: Active, 15 days)
const fifteenDaysFuture = new Date(today);
fifteenDaysFuture.setDate(today.getDate() + 15);
const result1 = calculateStatusAndDays(fifteenDaysFuture);

console.log(`Test 1 (+15 Days Future):`);
console.log(`  Expected: Status: Active, Days: 15`);
console.log(`  Got:      Status: ${result1.status}, Days: ${result1.remainingDays}`);
const pass1 = result1.status === 'Active' && result1.remainingDays === 15;
console.log(`  Verdict:  ${pass1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test case 2: Expiry date 5 days in future (Expected: Expiring Soon, 5 days)
const fiveDaysFuture = new Date(today);
fiveDaysFuture.setDate(today.getDate() + 5);
const result2 = calculateStatusAndDays(fiveDaysFuture);

console.log(`Test 2 (+5 Days Future):`);
console.log(`  Expected: Status: Expiring Soon, Days: 5`);
console.log(`  Got:      Status: ${result2.status}, Days: ${result2.remainingDays}`);
const pass2 = result2.status === 'Expiring Soon' && result2.remainingDays === 5;
console.log(`  Verdict:  ${pass2 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test case 3: Expiry date 2 days in past (Expected: Expired, 0 days)
const twoDaysPast = new Date(today);
twoDaysPast.setDate(today.getDate() - 2);
const result3 = calculateStatusAndDays(twoDaysPast);

console.log(`Test 3 (-2 Days Past):`);
console.log(`  Expected: Status: Expired, Days: 0`);
console.log(`  Got:      Status: ${result3.status}, Days: ${result3.remainingDays}`);
const pass3 = result3.status === 'Expired' && result3.remainingDays === 0;
console.log(`  Verdict:  ${pass3 ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('--------------------------------------------------');
if (pass1 && pass2 && pass3) {
  console.log('🟢 ALL SYSTEM CALCULATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.log('🔴 SOME CALCULATION TESTS ENCOUNTERED FAILURES!');
  process.exit(1);
}
console.log('--------------------------------------------------');
