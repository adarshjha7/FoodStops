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
  const mainFolderPath = path.join(process.cwd(), mainFolderName, doj);

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
    // TODO: This cookie is ~1 year old and expired. Replace with a fresh one from your browser (see instructions).
    'Cookie': '_ga=GA1.1.744996262.1774862924; rbuuid=d87d05c0-2c1a-11f1-9ebd-db890fbd728d; mriClientId=BRd87d2cd0-2c1a-11f1-9ebd-db890fbd728d; sessionUserType=GUEST; moe_uuid=df8b42d3-6ab4-4cd6-8298-a62538ad66b3; isBtt=false; funnelVariant=RESPONSIVE; country=IND; currency=INR; selectedCurrency=INR; language=en; defaultlanguage=en; _abck=1774FD07EDAD1FD46DD8C2B618227A6D~-1~YAAQM3xBF1fzOEefAQAAyljLgxAFjtYo8BFhoBHOSU+Nx2lrLcUk+y3mLqu20rQLwGDei+krnniq+GYEjFJ644fIc9WekI4K585fv8S29ErLThmTrsMgnshyt9w8FVzIxWkbpBQQcymhO+hF0S9ooxFpCOuudu4k73kh7jnDIv8qmxv/6E4V2VevV+OwlYuK8gdn42TKcxEGSX6GDCnSPFetFoDC0I8lyvc7fDwAeWdKholr7g+P4N2sRO3WEg1O4RBryYkAQlbeGwSu+YBwF6vj385GkHOJENMvB0vDc6+1zwa/NaYJGKzuKxiTkBBpsPyo9iQm2qhrMXQ+qXeuMGxoBwCFlcbS1EOSoXbL3cz4m1f2SO2WU1KKgPUKPQRLfIxXUckVqJi31ZJ222EDJdhMjIHGCn7luBU0rRNaLdLT9axNwJ/kUsZkrIfr9fY4jtz/3Md6iJmq+75N/mH9v32bBCCIBgyiuGDx7OM/vHa5ZvPaPMGuosXp19n1~-1~-1~-1~-1~-1; bm_sz=9081863EF9A11E688C70E358517CDE39~YAAQM3xBF1rzOEefAQAAyljLgwC09hsDe4JwqvGJgr0WF/BeuOF6vUzuXuDVzgg89sdEXnO+0hIlZ8CzVgNdasEL1vlP9Ugb6ldxrBAX9kYCyn5ykZJT2L1rajq3uB3fVUXk+xZYNJRFys1Zu3N6EiC7eaY9GWN2xjEZQC6+RG1svE2FwsWgoc773Zen30kwq7toSlUZSLB31uLwrqOG8CaGtsffsKiz3nr0ZG3uuRID+Go3ZhaiHuEEZRVQhiv8miPn8u6RzxrOGhuPsxtb5sK1f9QKm8XfXVWxD+CkSM3y24JqepUVD7ZQJEQ3z+Haix60JOTwgpAQp3HB00Mz4Yr/eEL/2edt+dh1Sc+e3y4JXSsFjBJQFho/WXvMzo6hgxGww2Jbxu9fXRqQxg==~3486519~3356208; rayBetaAB=V2; aiSmartFilterUIAB=V1; geolocationAB=V0; leanerFunnelAB=V2; paymentBackAB=V3; unifiedSrpTabsABNew=V2; retainAddonsAB=V2; srpInlineOfferAB=V0; priceVariantABEnh=V1; abExpsVariantsForMri=["rayBetaAB:V2","aiSmartFilterUIAB:V1","geolocationAB:V0","leanerFunnelAB:V2","paymentBackAB:V3","retainAddonsAB:V2","srpInlineOfferAB:V0","priceVariantABEnh:V1"]; referrer=search; defaultLanguage=en; mriSessionId=BR4b2973d0-84de-11f1-a391-1fe5eeffbc7d; env=PROD; buildVersion=PROD_ad1601a733; uuidAtSRP=724d65d1e1784a88a94cc3d182cb5c0d; channel=TAB; _gcl_au=1.1.1741166862.1784622577; rb_fpData=%7B%22userAgent%22%3A%22Mozilla%2F5.0%20(Linux%3B%20Android%2015%3B%20Pixel%209)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F150.0.0.0%20Mobile%20Safari%2F537.36%22%2C%22browser%22%3A%22Chrome%22%2C%22version%22%3A%22150.0.0.0%22%2C%22os%22%3A%22Android%22%2C%22osVersion%22%3A%2215%22%2C%22deviceType%22%3A%22Mobile%22%2C%22screenSize%22%3A%22973%2C851%22%2C%22screenDPI%22%3A2.0000000298023224%2C%22screenResolution%22%3A%221946.0000289976597x1702.0000253617764%22%2C%22screenColorDepth%22%3A24%2C%22aspectRatio%22%3A%22973%3A851%22%2C%22systemLanguage%22%3A%22en-IN%22%2C%22connection%22%3A%224g%22%2C%22effectiveConnection%22%3A%224g%22%2C%22timeZone%22%3A5.5%7D; prev_mriSessionId=BR4b2973d0-84de-11f1-a391-1fe5eeffbc7d; ak_bmsc=3FC459E67C7CE9A3B7DD84E2502231E9~000000000000000000000000000000~YAAQM3xBF+r0OEefAQAAy3DLgwAtwIYKDk/vhzJ5ob+/zXwb9RofM5zqIKKM1c83Wsp28DsZlbxkyhz3N5HFt3WtREIGtDb/t0JJ8ZwTytxhngXzKjul2n67iFYWonbScjzt4cC9aWtLtrS0tadoqh9RpaS1SNSbpQcVHYz6E3a7Qy7N/Zej6yDCmrqqla54XSPGWIyFq1pASunxmtF0wUeFqM/5a9RCAZoOTF+50MQWk9OK/C6v0w8mGmV+ULQio7BVo8ZQmD3sP9ehw6IyblS0u2NqmS7vVEIynkRKxQ8+ZI6uiZlCXx4pkDexLXWm4QLEP6x7ZJ8Kw2M1SQQX/ZrJKwlyop7ZxtV/BMsKfTCIOPYQ3t/4pYEHi+tqMt6yeh42gWfTFqwDXAgF3LXV9HosECWe1zZvxpLXCnJGL0AeDqPr4GEybF8V7yU0I2/7gy9mIhXOBXLyfN/G1E8F/eE1ug==; bm_sv=51CE1302F5ABE5C8FA7165EC427A49E8~YAAQM3xBF+v0OEefAQAAy3DLgwBjnIE6Gj6gwRZSjrHICynpBT2cKjWAYbsrcNAnxApEMY85AaoeVvx6YN//gBTZCEcyG+NLYQY/jpc8MpspQH0HxGxoHui193mDUu9L4DWH1N1vi6ZvOOW0sL20qrZq+HUyfRIO3032P/4BAdF922PUqjta9QeaiKbt0r/AjaKegllwHUYRg+Sl7W+oueKXfGyBykYpD/6ai0UL8wrA7x73l0jPMhXvrDqjSxI=~1; _ga_W2P7QGN8S2=GS2.1.s1784622572$o18$g1$t1784622589$j43$l0$h1190547518',
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
const fromCityName = "Hyderabad";

// Dates to fetch, in "DD-MMM-YYYY" format (as required by the Redbus search API).
// Add/remove dates here to control which days get scraped (e.g. weekends).
const dojList = [
  "30-Sep-2026", // Wed
  "01-Oct-2026", // Thu
  "02-Oct-2026", // Fri
  "05-Oct-2026", // Mon
  "06-Oct-2026", // Tue
  // 03-Oct-2026 (Sat) and 04-Oct-2026 (Sun) already fetched previously
];

const cityList = [
  {name: "Bangalore", toCityId: 122},
  {name: "Tirupathi", toCityId: 71756},
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

for (const doj of dojList) {
  for (const city of cityList) {
    console.log(`Processing toCity: ${city.name} (ID: ${city.toCityId}) for ${doj}`);
    await fetchAndStoreBusDetails(fromCityId, city.toCityId, doj, fromCityName, city.name);
  }
}

