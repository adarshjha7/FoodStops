/**
 * A Node.js script to fetch bus route details from Redbus and save them
 * into a structured directory format.
 * This version uses a POST request with a data payload and all specified headers.
 *
 * Author: Gemini
 * Date: 29-Jul-2025
 */

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

async function fetchAndStoreBusDetails(fromCityId, toCityId, doj, fromCityName, toCityName) {
  const mainFolderName = `${fromCityName}-${toCityName}`;
  const mainFolderPath = path.join(process.cwd(), mainFolderName);

  try {
    await fs.mkdir(mainFolderPath, { recursive: true });
    console.log(`✅ Directory created: ${mainFolderPath}`);
  } catch (error) {
    console.error(`❌ Failed to create main directory: ${error.message}`);
    return;
  }

  // Define all headers from the new curl command
  const headersForFirstApi = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'dnt': '1',
    'origin': 'https://www.redbus.in',
    'priority': 'u=1, i',
    'referer': `https://www.redbus.in/bus-tickets/${fromCityName.toLowerCase()}-to-${toCityName.toLowerCase()}`,
    'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'traceparent': '00-cf4373924643855e3c98548e240b00cc-b1961d9a4d0cb5de-01',
    'tracestate': '1234567@nr=0-1-1234567-123456789-b1961d9a4d0cb5de----1753790589098',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'Cookie': '_abck=E54AABABFD3D3A61EDE939AC38771061~-1~YAAQKnxBF4At/VOYAQAARo//Vg4sTAQRTj2ETX8nHumThtTN4vJ3GF0kL/K9gSaLwDzPkPJEnfhj/wwvBnc85ottchEM1KbJaFRueaWbMVQ8hf48GWWYncY4HUAtnIe41QC1f/J34QW5Nt8xFseO3HiJt+1Wu06UmeduwrylZNpEzof1pF/cb3VgRzZfkQCuDhL/DAwWRCbU0p3vsuvvZKnZxEuOrtLw4RXLLpzMnDkJFxIQnredJfxkohnWE6mlSpM+MVR84Qpj2bUeaylfJG+TOX1EbyAU1J7TiZCmOZ59rM0SlhhfOaBwOCOZWRDzqbhsAc0ww8G0k0xB1ycO3tuKY3i6hCB0JPCPpayVY8dYH031Pc3nXm+ghh+6I8dT6d52bmUtjRHwguNMQw9jwdap1pvKIGdOS8K7eRZJ0GAiay9i6EaLCQhoxMnIgUFcHFrHjEQITAkoMqlqeU/VhCo=~-1~-1~-1; ak_bmsc=C2FF03015EACB5D1915AAB4D1EFC7839~000000000000000000000000000000~YAAQKnxBF4Et/VOYAQAARo//VhyQZAeV7adh2ySrCcnXsFGc+SMWu6xjyLgWd0g/KHEOAgfc2Ta9Rp+o4D/SAoePXHYd03it78kzSnPj8ufKxr2mfZNcW+ame8HgSPpg9d2b9uKiPgyVHMj8HElKjXvuY7A5ftsJGlCAenTxepNSkyc+xvCaM9NzOLbzCfs1wVIKgiNYW3J7l6W8a6Hui+dCQyuLGlI7N7JIN+BymYBGNH+IfRqv/pme/9F30zLqJnDa+HDISPnIIke+mhgG0Q2uqOXbGIsrsryZYNTdj2EhoeprFc1PnQvDSvHJ6ympR/0WNCMQkqXklBAsZUnfN+/GyDq4mtkONg==; bm_sv=D50E0C25DF88DED93134545608349465~YAAQKnxBF8dk/VOYAQAAI/UDVxxhtpuxZeA9F2YWO6a1c2ZDOJWPc17dpIOvuPmgntzGVii9wZHf/65d3dWkyDXUfcgoyit8rBgqZydgHFvYJ1hHBkicfmkQ1tY8ZyJKOnhr0gutp5chngcIU1ex58ZIRl3YFhsMX7EvJ2RsiCh51tctoWb+JvaA5agZx6wplVrixebMVi/EWnIxKBVhcF25vUg/ORpVqkPZl+gkSdWEV3R1xEdoHJNnAo5LE4Q=~1; bm_sz=E87BFFD66EF6F32A74E36690253FCFC0~YAAQKnxBF4It/VOYAQAARo//VhwYDDn5UxGNq6/lsnKO+cVp8wzycjisKTPuOD6q26h/ZMKlXztibpDW9IAYV3F6QgidP0oBczvMcmCPveUPnDWuRlhVR1zzsAYW+4k6qezJSBx5CmmELSI6UY/h5+ii2PGmHcvoFeOay0ZN00ATjsnZoTZ+UWeOIImzn+D5a/iws5x1/zjfJfRqaS/JFJtJcXdQssX1vv41/xG9evDUS3FSEvS20BcahyTQ+nEgN3BGDz2ik5hIr5zBqt1byMcmJTQ6tv//qGFCLoJvsKddfTSz539MXVfjLtqfIsFJyXBTxSuXd/6gp5I5YoAjij0XctB+y4tkNqbe5hI=~4340021~3228473; buildVersion=PROD_be175bc312; country=IND; currency=INR; defaultLanguage=en; env=PROD; language=en; mriClientId=BRd10c1d31-3477-11f0-bf18-2b3065f2fe0d; mriSessionId=BR71eafde0-6c98-11f0-9983-b5e4013eb7cb; rbuuid=d10c1d30-3477-11f0-bf18-2b3065f2fe0d; selectedCurrency=INR',
  };

  // Define the data payload for the POST request
  const dataPayload = {
    "appliedFilterCount": 0, "onlyShow": [], "dt": [], "SeaterType": [], "AcType": [],
    "travelsList": [], "amtList": [], "bpList": [], "dpList": [], "CampaignFilter": [],
    "at": [], "persuasionList": [], "bpIdentifier": [], "dpIdentifier": [], "bcf": [],
    "opBusTypeFilterList": [], "priceRange": [], "RouteIds": [], "bpKeys": [], "dpKeys": [],
    "streaksFilter": [], "preRouteFilters": {}
  };

  const searchUrl = `https://www.redbus.in/rpw/api/searchResults?fromCity=${fromCityId}&toCity=${toCityId}&DOJ=${doj}&limit=200&offset=0&meta=true&groupId=0&sectionId=0&sort=0&sortOrder=0&from=initialLoad&getUuid=true&bT=1&clearLMBFilter=undefined`;

  console.log(`\n🔍 Making POST request to fetch bus list for ${fromCityName} to ${toCityName} on ${doj}...`);
  console.log(searchUrl);
  try {
    // IMPORTANT: Changed from axios.get to axios.post and added the data payload
    const searchResponse = await axios.post(searchUrl, dataPayload, { headers: headersForFirstApi });
    const inventories = searchResponse.data?.data?.inventories;

    if (!inventories || inventories.length === 0) {
      console.log("No bus services found for the selected route and date.");
      return;
    }

    console.log(`Found ${inventories.length} bus services. Now fetching individual details...\n`);

    for (const inventory of inventories) {
      const { routeId, operatorId, serviceId } = inventory;

      if (!routeId || !operatorId || !serviceId) {
        console.warn(`⚠️ Skipping an inventory item due to missing IDs.`);
        continue;
      }

      const subFolderName = `${routeId}_${operatorId}_${serviceId}`;
      const subFolderPath = path.join(mainFolderPath, subFolderName);
      const fileName = `${routeId}_serviceDetails.json`;
      const finalFilePath = path.join(subFolderPath, fileName);

      try {
        await fs.mkdir(subFolderPath, { recursive: true });

        const layoutUrl = `https://www.redbus.in/rpw/api/seatLayout?doj=${doj}&routeId=${routeId}&oid=${operatorId}`;
        console.log(layoutUrl);
        const layoutResponse = await axios.get(layoutUrl);
        const serviceDetails = layoutResponse.data;
        // console.log(layoutResponse);
        await fs.writeFile(finalFilePath, JSON.stringify(serviceDetails, null, 2));
        console.log(`  -> Successfully saved details for service: ${subFolderName}`);
      } catch (detailError) {
        console.error(`  -> ❌ Failed to process service ${subFolderName}: ${detailError.message}`);
      }
    }
    console.log("\n✅ All tasks completed!");

  } catch (error) {
    console.error(`❌ A critical error occurred while fetching search results: ${error.message}`);
    if (error.response?.status) {
        console.error(`Status Code: ${error.response.status}`);
    }
  }
}

// --- Main Execution ---
// Updated to match the latest curl command
const fromCityId = 124; // Hyderabad
const doj = "31-Jul-2025";
const fromCityName = "Hyderabad";

const cityList = [
  {name: "Bangalore", toCityId: 122},
  {name: "Tirupathi", toCityId: 71756}
  { name: "Mysuru", toCityId: 129 },
  { name: "Coimbatore", toCityId: 141 },
  { name: "Pondicherry", toCityId: 233 },
  { name: "Chittoor", toCityId: 653 },
  { name: "Pulivendula", toCityId: 1322 },
  { name: "Kadiri", toCityId: 415 },
  { name: "Proddutur", toCityId: 634 },
  { name: "Madanapalle", toCityId: 399 },
  { name: "Thiruvannamali", toCityId: 293 }
];

for (const city of cityList) {
  
  console.log(`Processing toCity: ${city.name} (ID: ${city.toCityId})`);
  await fetchAndStoreBusDetails(fromCityId, city.toCityId, doj, fromCityName, city.name);
}

