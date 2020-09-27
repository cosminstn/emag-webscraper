import { chromium } from "playwright";
const getEmagProductInfo = async function (product: string) {
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

    await page.fill(".searchbox-wrapper #searchboxTrigger", product);
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

    const productCodeHandler = await page.waitForSelector(
        "#page-skin > .container > .page-skin-inner > .page-header > .clearfix > .product-code-display"
    );
    const productCode = (await productCodeHandler.innerText()).replace(
        "Cod produs: ",
        ""
    );

    let reviewsScore = null;
    let noReviews = 0;
    try {
        const reviewsScoreHandler = await page.waitForSelector(
            ".page-skin-inner > .row > .col-sm-5 > .product-highlights-wrapper > .row > .col-sm-12 > .product-highlight > .star-rating-container > .star-rating-text",
            {
                timeout: 2000,
            }
        );
        reviewsScore = await reviewsScoreHandler.innerText();

        const noReviewsHandler = await page.waitForSelector(
            ".page-skin-inner > .row > .col-sm-5 > .product-highlights-wrapper > .row > .col-sm-12 > .product-highlight > .hidden-xs > .gtm_rp160118",
            {
                timeout: 100,
            }
        );
        noReviews = parseInt(await noReviewsHandler.innerText());
    } catch {}

    console.log(
        `Product: ${product} Found price: ${price}, product code: ${productCode}, reviews score: ${reviewsScore}, no reviews: ${noReviews}`
    );

    await page.close();
    await browser.close();
};

(async () => {
    const products = [
        "apple watch 6 44mm",
        "iphone 11",
        "iphone 11 pro",
        "samsung s20",
        "ipad pro 2020",
    ];

    const startTime = Date.now();

    const promises = products.map((product) => getEmagProductInfo(product));

    await Promise.all(promises);
    const timeEffortInMillis = Date.now() - startTime;
    // TODO: Am incercat si sa refolosesc acelasi obiect de browser si pentru cazul curent salvez 1 secunda, doar ca pare ca nu se mai ajusteaza inaltimea ferestrei de browser la dimensiunea dorita.
    console.log(`Time effort:  ${timeEffortInMillis} millis`);
})();
