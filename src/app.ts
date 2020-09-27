import { chromium } from "playwright";
(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const navigationPromise = page.waitForNavigation();

    await page.goto("https://www.emag.ro/");

    await page.setViewportSize({ width: 1278, height: 1287 });

    await navigationPromise;

    // search for the product
    await page.waitForSelector(".searchbox-wrapper #searchboxTrigger");
    await page.click(".searchbox-wrapper #searchboxTrigger");

    await page.fill(".searchbox-wrapper #searchboxTrigger", "iphone 11");
    await page.press(".searchbox-wrapper #searchboxTrigger", "Enter");

    await navigationPromise;

    // wait for results to show up & click the first result
    await page.waitForSelector(
        ".card-section-top > .card-heading > .thumbnail-wrapper:nth-child(2) > .thumbnail > .lozad"
    );
    await page.click(
        ".card-section-top > .card-heading > .thumbnail-wrapper:nth-child(2) > .thumbnail > .lozad"
    );

    await navigationPromise;

    const priceHandler = await page.waitForSelector(
        ".product-highlight > div > .d-inline-flex > .w-50 > .product-new-price"
    );

    const price = await priceHandler.innerText();

    console.log("Found price: " + price);

    await page.close();
    await browser.close();
})();
