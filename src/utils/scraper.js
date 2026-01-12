const puppeteer = require('puppeteer');

const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    
    // Step 1: Paisa hata do
    const cleanStr = priceStr.split('.')[0];
    
    // Step 2: Digits nikalne ke liye regex
    const matches = cleanStr.match(/[\d,]+/g);
    if (!matches) return 0;
    
    // Step 3: Parse number
    const prices = matches
        .map(m => parseInt(m.replace(/[^\d]/g, '')))
        .filter(n => !isNaN(n) && n > 0);
        
    if (prices.length === 0) return 0;
    return Math.min(...prices);
};

const launchOptions = {
    headless: "new",
    args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
};

async function scrapeUrl(url) {
    if (!url) return null;
    const start = Date.now();
    console.log(`[Scraper] 🕷️ Initiating: ${url}`);
    
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        const title = await page.title();
        console.log(`[Scraper] 📄 Page Title: "${title}"`);

        if (title.includes("404") || title.includes("Not Found")) {
            console.error("[Scraper] ❌ 404 Error: Page not found.");
            await browser.close();
            return null;
        }

        let price = 0;
        let inStock = false;
        let vendor = ""; 
        let rawPriceText = "";

        if (url.includes('mdcomputers.in')) {
            vendor = "mdcomputers";
            rawPriceText = await page.evaluate(() => {
                const priceBox = document.querySelector('.product-price-info-group .price-box');
                if (priceBox) {
                    const specialPrice = priceBox.querySelector('h2.special-price');
                    if (specialPrice) return specialPrice.innerText;
                }
                const fallback = document.querySelector('.price-new') || 
                                 document.querySelector('.product-price') || 
                                 document.querySelector('.price');
                return fallback?.innerText || '0';
            });
            
            inStock = await page.evaluate(() => {
                const btn = document.querySelector('#button-cart');
                const stockStatus = document.querySelector('.stock-status');
                const isOos = stockStatus && stockStatus.innerText.toLowerCase().includes('out of stock');
                return btn && !btn.disabled && btn.style.display !== 'none' && !isOos;
            });
        }
        else if (url.includes('vedantcomputers.com')) {
            vendor = "vedant";
            rawPriceText = await page.evaluate(() => {
                const el = document.querySelector('.product-price-new') || 
                           document.querySelector('.product-price') || 
                           document.querySelector('.price-new');
                return el?.innerText || '0';
            });
            inStock = await page.evaluate(() => !!document.querySelector('#button-cart'));
        }
        else if (url.includes('primeabgb.com')) {
            vendor = "primeabgb";
            rawPriceText = await page.evaluate(() => {
                const summary = document.querySelector('.summary.entry-summary');
                if (summary) {
                    const insPrice = summary.querySelector('ins .woocommerce-Price-amount');
                    if (insPrice) return insPrice.innerText;
                    
                    const singlePrice = summary.querySelector('.price .woocommerce-Price-amount');
                    if (singlePrice) return singlePrice.innerText;
                }
                return '0';
            });
            inStock = await page.evaluate(() => !document.querySelector('.stock.out-of-stock'));
        }
        else if (url.includes('elitehubs.com')) {
            vendor = "elitehubs";
            rawPriceText = await page.evaluate(() => {
                const el = document.querySelector('#js-product-price.current') || 
                           document.querySelector('.price .current') ||
                           document.querySelector('.price .woocommerce-Price-amount') || 
                           document.querySelector('.price');
                return el?.innerText || '0';
            });
            inStock = await page.evaluate(() => !document.querySelector('.stock.out-of-stock'));
        }

        price = parsePrice(rawPriceText);
        console.log(`[Scraper] 💰 Parsed: ₹${price} (Stock: ${inStock})`);

        await browser.close();
        return { vendor, price, inStock }; 

    } catch (error) {
        console.error(`[Scraper] ❌ Failure: ${error.message}`);
        await browser.close();
        return null;
    }
}

async function scrapeSpecs(url) {
    if (!url) return {};
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const extractedSpecs = await page.evaluate(() => {
            const specs = {};
            const rows = document.querySelectorAll('tr');
            rows.forEach(row => {
                const cols = row.querySelectorAll('td, th');
                if (cols.length === 2) {
                    const key = cols[0].innerText.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                    const val = cols[1].innerText.trim();
                    if (key && val && key.length < 30) specs[key] = val;
                }
            });
            return specs;
        });
        await browser.close();
        return extractedSpecs;
    } catch (error) {
        await browser.close();
        return {};
    }
}

module.exports = { scrapeUrl, scrapeSpecs };