/**
 * Collapses busesList.csv down to one row per unique bus (ServiceIdentifier + Route),
 * restricted to a date range, dropping DOJ/DayOfWeek so repeats across days don't
 * show up as duplicates.
 *
 * Usage:
 *   node weeklyBuses.cjs 2026-09-30 2026-10-06
 */

const fs = require('fs');
const path = require('path');

const INPUT_CSV_FILE = 'busesList.csv';
const OUTPUT_CSV_FILE = 'busesList_Weekly_NoDupes.csv';

function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields.map(f => f.trim());
}

function main() {
  const [startDate, endDate] = process.argv.slice(2);
  if (!startDate || !endDate) {
    console.error('❌ Usage: node weeklyBuses.cjs <startDate YYYY-MM-DD> <endDate YYYY-MM-DD>');
    process.exit(1);
  }

  const csvPath = path.join(__dirname, INPUT_CSV_FILE);
  const lines = fs.readFileSync(csvPath, 'utf-8').split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const dojIdx = header.findIndex(h => h === 'DOJ');
  const serviceIdx = header.findIndex(h => h === 'ServiceIdentifier');
  const routeIdx = header.findIndex(h => h === 'Route');

  const seen = new Set();
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const doj = row[dojIdx];
    if (doj < startDate || doj > endDate) continue;

    const key = `${row[serviceIdx]}_${row[routeIdx]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }

  // Drop DOJ/DayOfWeek columns from output since a bus is no longer tied to one date.
  const keepIdx = header.map((_, i) => i).filter(i => i !== dojIdx && header[i] !== 'DayOfWeek');
  const outHeader = keepIdx.map(i => header[i]);
  const outRows = rows.map(row => keepIdx.map(i => row[i]));

  console.log(`\n🔍 Unique buses (${startDate} to ${endDate}): ${outRows.length}\n`);
  for (const row of outRows) console.log(row.join(' | '));

  const csvContent = [outHeader.join(','), ...outRows.map(r => r.join(','))].join('\n');
  fs.writeFileSync(path.join(__dirname, OUTPUT_CSV_FILE), csvContent);
  console.log(`\n✅ Saved deduped weekly list to ${OUTPUT_CSV_FILE}`);
}

main();
