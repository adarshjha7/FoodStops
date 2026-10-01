/**
 * Filters busesList.csv (produced by generateList.cjs) down to buses whose
 * arrival time at a given stop falls within a given time window.
 *
 * Usage:
 *   node filterStop.cjs Jadcherla                       -> defaults to 20:00-22:30, all days
 *   node filterStop.cjs Shamshabad 18:00 21:30          -> custom window (24h HH:MM)
 *   node filterStop.cjs Shamshabad 18:00 21:30 --weekend -> only Saturday/Sunday departures
 */

const fs = require('fs');
const path = require('path');

const INPUT_CSV_FILE = 'busesList.csv';

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Minimal CSV line parser that respects double-quoted fields containing commas.
function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        fields.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
  }
  fields.push(cur);
  return fields.map(f => f.trim());
}

function main() {
  const rawArgs = process.argv.slice(2);
  const weekendOnly = rawArgs.includes('--weekend');
  const positional = rawArgs.filter(a => !a.startsWith('--'));

  const stopName = positional[0];
  if (!stopName) {
    console.error('❌ Usage: node filterStop.cjs <StopName> [start HH:MM] [end HH:MM] [--weekend]');
    process.exit(1);
  }
  const startStr = positional[1] || '20:00';
  const endStr = positional[2] || '22:30';
  const startMin = toMinutes(startStr);
  const endMin = toMinutes(endStr);

  const csvPath = path.join(__dirname, INPUT_CSV_FILE);
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ ${INPUT_CSV_FILE} not found. Run "node generateList.cjs" first.`);
    process.exit(1);
  }

  const lines = fs.readFileSync(csvPath, 'utf-8').split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const stopTimeIdx = header.findIndex(h => h.includes(`BoardingTime@${stopName}`));
  const dayOfWeekIdx = header.findIndex(h => h.includes('DayOfWeek'));

  if (stopTimeIdx === -1) {
    console.error(`❌ Could not find "BoardingTime@${stopName}" column in busesList.csv. Only Shamshabad/Jadcherla are tracked by generateList.cjs.`);
    process.exit(1);
  }
  if (weekendOnly && dayOfWeekIdx === -1) {
    console.error('❌ --weekend was requested but busesList.csv has no "DayOfWeek" column. Re-run generateList.cjs.');
    process.exit(1);
  }

  const matches = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const timeStr = row[stopTimeIdx];
    if (!timeStr || timeStr === 'N/A' || !/^\d{1,2}:\d{2}$/.test(timeStr)) continue;

    if (weekendOnly) {
      const day = row[dayOfWeekIdx];
      if (day !== 'Saturday' && day !== 'Sunday') continue;
    }

    const mins = toMinutes(timeStr);
    if (mins >= startMin && mins <= endMin) {
      matches.push(row);
    }
  }

  matches.sort((a, b) => toMinutes(a[stopTimeIdx]) - toMinutes(b[stopTimeIdx]));

  console.log(`\n🔍 Buses arriving at ${stopName} between ${startStr} and ${endStr}${weekendOnly ? ' (weekends only)' : ''}: ${matches.length}\n`);
  for (const row of matches) {
    console.log(row.join(' | '));
  }

  const outFile = `busesList_${stopName}_${startStr.replace(':', '')}to${endStr.replace(':', '')}.csv`;
  const csvContent = [header.join(','), ...matches.map(r => r.join(','))].join('\n');
  fs.writeFileSync(path.join(__dirname, outFile), csvContent);
  console.log(`\n✅ Saved filtered results to ${outFile}`);
}

main();
