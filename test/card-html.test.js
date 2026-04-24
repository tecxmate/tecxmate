/**
 * Tests for card.html JavaScript functionality
 * Run with: node test/card-html.test.js
 */

const assert = require('assert');

// ---------------------------------------------------------------------------
// parseJsonArray function (from card.html)
// ---------------------------------------------------------------------------
function parseJsonArray(jsonStr) {
  if (!jsonStr) return [];
  try {
    const arr = JSON.parse(jsonStr);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// escapeVCard function (from card.html)
// ---------------------------------------------------------------------------
function escapeVCard(value) {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

// ---------------------------------------------------------------------------
// saveContact vCard generation logic (from card.html)
// ---------------------------------------------------------------------------
function buildVCard(cardData) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(cardData.name)}`,
    `N:${escapeVCard(cardData.name)};;;`
  ];
  if (cardData.company) lines.push(`ORG:${escapeVCard(cardData.company)}`);
  if (cardData.job_title) lines.push(`TITLE:${escapeVCard(cardData.job_title)}`);

  // Multiple phones or legacy single
  const phones = parseJsonArray(cardData.phones_json);
  if (phones.length > 0) {
    phones.forEach(p => {
      const type = p.label === 'Work' ? 'WORK' : p.label === 'Home' ? 'HOME' : 'CELL';
      lines.push(`TEL;TYPE=${type}:${p.value}`);
    });
  } else if (cardData.phone) {
    lines.push(`TEL;TYPE=CELL:${cardData.phone}`);
  }

  // Multiple emails or legacy single
  const emails = parseJsonArray(cardData.emails_json);
  if (emails.length > 0) {
    emails.forEach(e => {
      const type = e.label === 'Work' ? 'WORK' : 'HOME';
      lines.push(`EMAIL;TYPE=${type}:${e.value}`);
    });
  } else if (cardData.email) {
    lines.push(`EMAIL:${cardData.email}`);
  }

  if (cardData.website) lines.push(`URL:${cardData.website}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

// ---------------------------------------------------------------------------
// Tests: parseJsonArray
// ---------------------------------------------------------------------------
console.log('Testing parseJsonArray...');

assert.deepStrictEqual(parseJsonArray(null), [], 'null returns empty array');
assert.deepStrictEqual(parseJsonArray(undefined), [], 'undefined returns empty array');
assert.deepStrictEqual(parseJsonArray(''), [], 'empty string returns empty array');
assert.deepStrictEqual(parseJsonArray('invalid json'), [], 'invalid JSON returns empty array');
assert.deepStrictEqual(parseJsonArray('[]'), [], 'empty array string returns empty array');
assert.deepStrictEqual(
  parseJsonArray('[{"label":"Work","value":"+1-555-0100"}]'),
  [{ label: 'Work', value: '+1-555-0100' }],
  'valid JSON array is parsed'
);
assert.deepStrictEqual(
  parseJsonArray('{"not":"array"}'),
  [],
  'JSON object returns empty array (not an array)'
);

console.log('  parseJsonArray tests passed!');

// ---------------------------------------------------------------------------
// Tests: escapeVCard
// ---------------------------------------------------------------------------
console.log('Testing escapeVCard...');

assert.strictEqual(escapeVCard('John Doe'), 'John Doe', 'plain text unchanged');
assert.strictEqual(escapeVCard('John, Doe'), 'John\\, Doe', 'comma escaped');
assert.strictEqual(escapeVCard('John; Doe'), 'John\\; Doe', 'semicolon escaped');
assert.strictEqual(escapeVCard('John \\ Doe'), 'John \\\\ Doe', 'backslash escaped');
assert.strictEqual(escapeVCard('John\nDoe'), 'John\\nDoe', 'newline escaped');
assert.strictEqual(
  escapeVCard('John, Doe; Jr.\\Sr.'),
  'John\\, Doe\\; Jr.\\\\Sr.',
  'multiple special chars escaped'
);

console.log('  escapeVCard tests passed!');

// ---------------------------------------------------------------------------
// Tests: buildVCard with legacy single phone/email
// ---------------------------------------------------------------------------
console.log('Testing buildVCard with legacy format...');

{
  const card = { name: 'John Doe', phone: '+1-555-0100' };
  const vcard = buildVCard(card);
  assert(vcard.includes('TEL;TYPE=CELL:+1-555-0100'), 'legacy phone included');
}

{
  const card = { name: 'John Doe', email: 'john@example.com' };
  const vcard = buildVCard(card);
  assert(vcard.includes('EMAIL:john@example.com'), 'legacy email included');
}

console.log('  Legacy format tests passed!');

// ---------------------------------------------------------------------------
// Tests: buildVCard with multiple phones/emails
// ---------------------------------------------------------------------------
console.log('Testing buildVCard with multiple phones/emails...');

{
  const card = {
    name: 'John Doe',
    phones_json: JSON.stringify([
      { label: 'Mobile', value: '+1-555-0100' },
      { label: 'Work', value: '+1-555-0200' },
      { label: 'Home', value: '+1-555-0300' },
    ]),
  };
  const vcard = buildVCard(card);
  assert(vcard.includes('TEL;TYPE=CELL:+1-555-0100'), 'Mobile phone with CELL type');
  assert(vcard.includes('TEL;TYPE=WORK:+1-555-0200'), 'Work phone with WORK type');
  assert(vcard.includes('TEL;TYPE=HOME:+1-555-0300'), 'Home phone with HOME type');
}

{
  const card = {
    name: 'John Doe',
    emails_json: JSON.stringify([
      { label: 'Work', value: 'john@work.com' },
      { label: 'Home', value: 'john@home.com' },
    ]),
  };
  const vcard = buildVCard(card);
  assert(vcard.includes('EMAIL;TYPE=WORK:john@work.com'), 'Work email with WORK type');
  assert(vcard.includes('EMAIL;TYPE=HOME:john@home.com'), 'Home email with HOME type');
}

console.log('  Multiple phones/emails tests passed!');

// ---------------------------------------------------------------------------
// Tests: phones_json takes priority over legacy phone
// ---------------------------------------------------------------------------
console.log('Testing priority of new format over legacy...');

{
  const card = {
    name: 'John Doe',
    phone: '+1-555-LEGACY',
    phones_json: JSON.stringify([{ label: 'Mobile', value: '+1-555-NEW' }]),
  };
  const vcard = buildVCard(card);
  assert(vcard.includes('+1-555-NEW'), 'new phone included');
  assert(!vcard.includes('+1-555-LEGACY'), 'legacy phone NOT included');
}

{
  const card = {
    name: 'John Doe',
    email: 'legacy@example.com',
    emails_json: JSON.stringify([{ label: 'Work', value: 'new@example.com' }]),
  };
  const vcard = buildVCard(card);
  assert(vcard.includes('new@example.com'), 'new email included');
  assert(!vcard.includes('legacy@example.com'), 'legacy email NOT included');
}

console.log('  Priority tests passed!');

// ---------------------------------------------------------------------------
// Tests: Empty arrays
// ---------------------------------------------------------------------------
console.log('Testing empty arrays...');

{
  const card = {
    name: 'John Doe',
    phones_json: '[]',
    emails_json: '[]',
  };
  const vcard = buildVCard(card);
  assert(!vcard.includes('TEL'), 'no TEL line for empty phones');
  assert(!vcard.includes('EMAIL'), 'no EMAIL line for empty emails');
}

console.log('  Empty arrays tests passed!');

// ---------------------------------------------------------------------------
// Tests: Full vCard structure
// ---------------------------------------------------------------------------
console.log('Testing full vCard structure...');

{
  const card = {
    name: 'John Doe',
    phones_json: JSON.stringify([
      { label: 'Mobile', value: '+1-555-0100' },
      { label: 'Work', value: '+1-555-0200' },
    ]),
    emails_json: JSON.stringify([
      { label: 'Work', value: 'john@work.com' },
    ]),
    company: 'Acme Corp',
    job_title: 'Engineer',
    website: 'https://johndoe.com',
  };
  const vcard = buildVCard(card);

  assert(vcard.startsWith('BEGIN:VCARD'), 'starts with BEGIN:VCARD');
  assert(vcard.endsWith('END:VCARD'), 'ends with END:VCARD');
  assert(vcard.includes('VERSION:3.0'), 'has VERSION:3.0');
  assert(vcard.includes('FN:John Doe'), 'has FN field');
  assert(vcard.includes('ORG:Acme Corp'), 'has ORG field');
  assert(vcard.includes('TITLE:Engineer'), 'has TITLE field');
  assert(vcard.includes('URL:https://johndoe.com'), 'has URL field');
  assert(vcard.includes('\r\n'), 'uses CRLF line endings');
}

console.log('  Full vCard structure tests passed!');

// ---------------------------------------------------------------------------
// Tests: Label mapping for "Other"
// ---------------------------------------------------------------------------
console.log('Testing "Other" label mapping...');

{
  const card = {
    name: 'John Doe',
    phones_json: JSON.stringify([{ label: 'Other', value: '+1-555-0100' }]),
  };
  const vcard = buildVCard(card);
  assert(vcard.includes('TEL;TYPE=CELL:'), 'Other phone maps to CELL');
}

{
  const card = {
    name: 'John Doe',
    emails_json: JSON.stringify([{ label: 'Other', value: 'john@other.com' }]),
  };
  const vcard = buildVCard(card);
  assert(vcard.includes('EMAIL;TYPE=HOME:'), 'Other email maps to HOME');
}

console.log('  "Other" label mapping tests passed!');

// ---------------------------------------------------------------------------
// All tests passed
// ---------------------------------------------------------------------------
console.log('\n✅ All card.html tests passed!');
