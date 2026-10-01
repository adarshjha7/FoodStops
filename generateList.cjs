/**
 * A Node.js script to analyze downloaded Redbus data.
 * It recursively finds all service detail JSON files, checks for boarding points
 * in "Shamshabad", and writes the matching bus services and their boarding times
 * to a CSV file.
 *
 * Author: Gemini
 * Date: 29-Jul-2025
 */

const fs = require('fs/promises');
const path = require('path');

// --- Configuration ---
const ROOT_DIRECTORY_NAME = 'Hyderabad-Bangalore'; // Change if your folder name is different
const OUTPUT_CSV_FILE = 'busesList.csv';
const OUTPUT_NO_JADCHERLA_CSV_FILE = 'busesList_NoJadcherlaStop.csv';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

// fetchStops.js saves each date's data under a "<From>-<To>/<DD-MMM-YYYY>/..." folder.
// That's the DOJ we actually requested, which is more trustworthy than the API's
// echoed DateOfJourney field (observed to sometimes reflect a different date/year
// than what was requested, likely due to schedule-template caching upstream).
function dojFromFilePath(filePath) {
  const match = filePath.match(/[\\/](\d{2}-[A-Za-z]{3}-\d{4})[\\/]/);
  if (!match) return null;
  const [d, mon, y] = match[1].split('-');
  const mm = MONTHS[mon];
  if (!mm) return null;
  return `${y}-${mm}-${d}`;
}

function dayOfWeekFor(isoDate) {
  // isoDate as "YYYY-MM-DD".
  if (!isoDate) return 'N/A';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return DAY_NAMES[d.getDay()];
}

/**
 * Recursively finds all files with a specific name pattern in a directory.
 * @param {string} dirPath - The directory path to start searching from.
 * @param {string} filePattern - The pattern of the file to search for.
 * @returns {Promise<string[]>} A promise that resolves to an array of full file paths.
 */
async function findFilesRecursive(dirPath, filePattern) {
    let allFiles = [];
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                allFiles = allFiles.concat(await findFilesRecursive(fullPath, filePattern));
            } else if (entry.name.endsWith(filePattern)) {
                allFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}: ${error.message}`);
    }
    return allFiles;
}

/**
 * Main function to process the JSON files and generate a CSV.
 */
async function analyzeAndGenerateCsv() {
    let busesList = [];
    const rootPath = path.join(__dirname);
    console.log(`🔍 Starting analysis in directory: ${rootPath}`);

    const jsonFiles = await findFilesRecursive(rootPath, '_serviceDetails.json');

    if (jsonFiles.length === 0) {
        console.log(`❌ No '_serviceDetails.json' files found in '${ROOT_DIRECTORY_NAME}'. Please run the first script to download data.`);
        return;
    }
    console.log(`Found ${jsonFiles.length} service detail files to analyze.`);

    const matchingBuses = [];
    const noJadcherlaBuses = []; // stops at Shamshabad but has no confirmed Jadcherla boarding point (e.g. FlixBus, Zingbus)
    const seenKeys = new Set();

    for (const filePath of jsonFiles) {
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(fileContent);

            if (!data.BPInformationList || !data.services || !data.Travels) {
                continue;
            }

            // Find the specific boarding point object for "Shamshabad"
            const shamshabadStop = data.BPInformationList.find(bp =>
                bp.Name && (bp.Name.toLowerCase().includes('shamshad') || bp.Name.toLowerCase().includes('shams'))
            );
            const jadcherlaStop = data.BPInformationList.find(bp =>
                bp.Name && (bp.Name.toLowerCase().includes('jadcherla'))
            );

            // If a matching stop is found, extract its details including the time
            if (shamshabadStop || jadcherlaStop) {
                const operatorId = data.services[0].operatorId;
                const serviceId = data.services[0].serviceId;
                const travelsName = data.services[0].Travels;
                const busType = data.services[0].busType;
                const doj = dojFromFilePath(filePath) || data.services[0].DateOfJourney || 'N/A';
                const dayOfWeek = dayOfWeekFor(doj === 'N/A' ? null : doj);

                const serviceIdentifier = `${operatorId}_${serviceId}`;
                const route = `${data.services[0].FromCity}-${data.services[0].ToCity}`;
                // Key includes route + date: the same operatorId_serviceId can legitimately
                // repeat across different routes or different dates.
                const dedupeKey = `${serviceIdentifier}_${route}_${doj}`;

                if (!seenKeys.has(dedupeKey)) {
                    seenKeys.add(dedupeKey);
                    const bus = {
                        serviceIdentifier,
                        travelsName: `"${travelsName.replace(/"/g, '""')}"`,
                        busType: `"${busType.replace(/"/g, '""')}"`,
                        boardingTime: shamshabadStop?.BpTm || 'N/A',  // Add the boarding time
                        boardingName: shamshabadStop?.Name || 'N/A',
                        boardingTime1: jadcherlaStop?.BpTm || 'N/A',
                        boardingName1: jadcherlaStop?.Name || 'N/A',
                        route,
                        doj,
                        dayOfWeek,
                    };

                    if (jadcherlaStop) {
                        matchingBuses.push(bus);
                    } else {
                        noJadcherlaBuses.push(bus);
                    }
                    busesList.push(dedupeKey);
                }
            }
        } catch (error) {
            console.error(`❌ Error processing file ${filePath}: ${error.message}`);
        }
    }

    console.log(`\nFound ${matchingBuses.length} buses with a confirmed Jadcherla boarding time.`);
    console.log(`Found ${noJadcherlaBuses.length} buses that stop at Shamshabad but have no confirmed Jadcherla boarding time (e.g. FlixBus/Zingbus).`);

    const csvHeader = 'ServiceIdentifier,TravelsName,BusType,BoardingTime@Shamshabad,BoardingPointName@Shamshabad, BoardingTime@Jadcherla,BoardingPointName@Jadcherla,Route,DOJ,DayOfWeek\n';
    const toCsvRow = bus =>
        `${bus.serviceIdentifier},${bus.travelsName},${bus.busType},${bus.boardingTime},${bus.boardingName},${bus.boardingTime1},${bus.boardingName1},${bus.route},${bus.doj},${bus.dayOfWeek}`;

    if (matchingBuses.length > 0) {
        const csvContent = csvHeader + matchingBuses.map(toCsvRow).join('\n');
        try {
            await fs.writeFile(OUTPUT_CSV_FILE, csvContent);
            console.log(`\n✅ Successfully created CSV file: ${OUTPUT_CSV_FILE}`);
        } catch (error) {
            console.error(`❌ Failed to write CSV file: ${error.message}`);
        }
    } else {
        console.log("No matching buses found to create a CSV file.");
    }

    if (noJadcherlaBuses.length > 0) {
        const csvContent = csvHeader + noJadcherlaBuses.map(toCsvRow).join('\n');
        try {
            await fs.writeFile(OUTPUT_NO_JADCHERLA_CSV_FILE, csvContent);
            console.log(`✅ Successfully created CSV file: ${OUTPUT_NO_JADCHERLA_CSV_FILE}`);
        } catch (error) {
            console.error(`❌ Failed to write CSV file: ${error.message}`);
        }
    }
}

// --- Start the analysis ---
analyzeAndGenerateCsv();