const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const AWS = require('aws-sdk');

(async() => {
    var credentials = new AWS.SharedIniFileCredentials({ profile: 'work-account' });
    AWS.config.credentials = new AWS.Config({ credentials: credentials });


    const args = process.argv.slice(2);
    theurl = "https://www.pccomponentes.com/sony-playstation-5-standard-ratchet-clank-una-dimension-aparte-ps5";
    if (args.length > 0) {
        theurl = args[0];
    }
    const browser = await puppeteer.launch({
        product: "chrome",
        headless: false,
        channel: "chrome",
        defaultViewport: { width: 1920, height: 1080 },
        userDataDir: "./datadir",
        args: [
            "--hide-scrollbars",
            "--disable-crash-reporter",
            '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36"'
        ]
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent(randomUseragent.getRandom());
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'es'
        });
        console.log("Getting url: " + theurl);
        await page.goto(theurl, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: "screenshot.png", fullPage: true });
        const userAgent = await page.evaluate(() => navigator.userAgent);
        console.log(userAgent)

        while (true) {
            const available = await page.evaluate(() => $(".js-article-buy").first().text().indexOf("Comprar") >= 0);
            console.log("available: " + available);
            if (available == false) {
                var waittimemillis = Math.floor(Math.random() * 3 * 60 * 1000) + (2 * 60 * 1000);
                console.log("waiting for reload " + (waittimemillis / 1000) + " secs");
                await page.waitForTimeout(waittimemillis);
                await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                console.log("reloaded")
            } else {
                //send notification
                const params = { Message: `Disponible ${theurl}`, TopicArn: "arn:aws:sns:eu-west-1:647799808205:avTopic" }
                await new AWS.SNS().publish(params).promise().then(
                    function(data) {
                        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
                        console.log("MessageID is " + data.MessageId);
                        continue;
                    }).catch(
                    function(err) {
                        console.error(err, err.stack);
                    });

                continue;
            }

        }


    } catch (e) {
        console.log(e);
    } finally {
        await browser.close();
    }


})();