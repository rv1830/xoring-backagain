const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { scrapeUrl } = require('../utils/scraper'); 

async function processSingleLink(comp) {
    try {
        console.log(`[Job] 🔎 Processing Component: ${comp.model_name}`);
        console.log(`[Job] 🌐 URL: ${comp.product_page_url}`);
        
        // 1. Scrape Data
        const data = await scrapeUrl(comp.product_page_url);
        
        // Validation: If scrape failed or price is 0
        if (!data || !data.price || data.price === 0) {
            console.log(`[Job] ⚠️ Skipped (No Data/Zero Price) for: ${comp.model_name}`);
            return;
        }

        // 2. Update DB (Directly in Component Table)
        await prisma.component.update({
            where: { id: comp.id },
            data: {
                tracked_price: data.price.toString(), // Database type ke according string ya number
                updatedAt: new Date()
            }
        });

        console.log(`[Job] ✅ Success: ₹${data.price} updated for ${comp.model_name}`);

    } catch (error) {
        console.error(`[Job] ❌ Error processing component ${comp.id}: ${error.message}`);
    }
}

async function runPriceTracker() {
    console.log("\n[Job] 🚀 24-Hour Price Tracker Started");
    try {
        // Fetch all components that have a product_page_url
        const trackedComponents = await prisma.component.findMany({
            where: {
                product_page_url: { 
                    not: null,
                    not: "" 
                }
            }
        });

        console.log(`[Job] Found ${trackedComponents.length} components with active URLs.`);

        for (const comp of trackedComponents) {
            await processSingleLink(comp);
            
            // Wait 10 seconds between requests to avoid IP blocking and server load
            await new Promise(resolve => setTimeout(resolve, 10000)); 
        }
        
        console.log("[Job] 💤 Price Tracker finished current cycle. Waiting for next 24 hours...\n");
    } catch (e) {
        console.error("[Job] 🔥 Critical Failure in runPriceTracker:", e.message);
    }
}

module.exports = { runPriceTracker, processSingleLink };