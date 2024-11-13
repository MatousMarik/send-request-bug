// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler } from 'crawlee';
import { CookieJar } from 'tough-cookie';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

interface Input {
    startUrls: string[];
    maxRequestsPerCrawl: number;
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    startUrls = ['https://crawlee.dev'],
    maxRequestsPerCrawl = 100,
} = await Actor.getInput<Input>() ?? {} as Input;

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: async ({ request: { url }, sendRequest, session }) => {
        session?.setCookie('ahoj=svete', url);
        const cookieJar = new CookieJar();
        await cookieJar.setCookie(session!.getCookieString(url), url);
        await cookieJar.setCookie('hello=world', url);
        const response = await sendRequest({
            headers: {
                cookie: 'hi=world',
                Cookie: 'hello=world',
            },
            cookieJar,
        });
        console.log(response.request.options.headers);
        console.log('JAR:', await cookieJar.getCookieString(url));
    },
});

await crawler.run(startUrls);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
