const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
(async() => {
    const args = process.argv.slice(2);
    theurl = "https://www.pccomponentes.com/sony-playstation-5-standard-ratchet-clank-una-dimension-aparte-ps5";
    if (args.length > 0) {
        theurl = args[0];
    }
    const browser = await puppeteer.launch({
        product: "chrome",
        headless: true,
        channel: "chrome",
        defaultViewport: { width: 1920, height: 1080 },
        args: [
            "--hide-scrollbars",
            "--disable-crash-reporter",
            '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36"'
        ]
    });
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'es'
    });
    console.log("Getting url: " + theurl);
    await page.goto(theurl, { waitUntil: 'networkidle2' });
    // await page.pdf({ path: 'page.pdf', format: 'A4' });
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(userAgent)
    const available = await page.evaluate(() => $(".js-article-buy").first().text().indexOf("Comprar") >= 0)
    console.log("available: " + available)
    await page.screenshot({ path: "screenshot.png", fullPage: true })
    await browser.close();
})();