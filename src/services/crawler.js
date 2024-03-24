const puppeteer = require('puppeteer');
const robotsParser = require('robots-parser');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { preprocessText } = require('../utils/helper');
const { vectorizeText } = require('./vectorize');
const { insertVector, searchVector } = require('./qdrant');
const { TopN } = require('../utils/constants');

async function crawlUrl({ url }) {
  try {
    const data = {};
    let bfsQueue = [url];
    const browser = await puppeteer.launch();
    const robotsTxtURL = `${new URL(url).origin}/robots.txt`;
    let robotsTxtContent;
    try {
      robotsTxtContent = await fetch(robotsTxtURL).then((res) => res.text());
    } catch (error) {
      console.error('Error fetching robots.txt:', error);
      robotsTxtContent = '';
    }
    const robotsTxt = robotsParser(robotsTxtURL, robotsTxtContent);
    const deduplicatedUrls = new Set(); // Track crawled URLs to avoid duplicates

    while (bfsQueue.length) {
      const queueUrl = bfsQueue.pop();
      if (deduplicatedUrls.has(queueUrl)) {
        console.log(`Skipping duplicate URL: ${queueUrl}`);
        continue;
      }
      deduplicatedUrls.add(queueUrl);

      console.log('crawling current url:', queueUrl);
      const page = await browser.newPage();
      try {
        await page.goto(queueUrl, { waitUntil: 'networkidle2' });

        // if (robotsTxt && !robotsTxt.isAllowed(queueUrl)) {
        //   console.log(`URL ${queueUrl} is disallowed by robots.txt`);
        //   await page.close();
        //   continue;
        // }
        const textData = await page.evaluate(() => {
          const textContent = [];
          const elements = document.querySelectorAll('*');
          for (const element of elements) {
            if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
              textContent.push(element.innerText);
            }
          }
          return textContent.join(' ');
        });

        const preprocessedText = preprocessText({ text: textData });
        data[queueUrl] = preprocessedText;

        // const hrefs = await page.$$eval("a", (anchorEls) =>
        //   anchorEls.map((a) => a.href)
        // );

        // const filteredHrefs = hrefs.filter(
        //   (href) =>
        //     new URL(href).origin === new URL(url).origin && // Same origin check
        //     !deduplicatedUrls.has(href) // Not already crawled
        // );
        // bfsQueue.push(...filteredHrefs);
      } catch (error) {
        console.error('Error while crawling:', error);
        data[queueUrl] = `Error: ${error.message}`;
      } finally {
        await page.close();
      }
    }
    await browser.close();
    return { ok: true, data };
  } catch (err) {
    console.error('Error in crawlerService: crawlUrl:', err.message);
    return { ok: false, err: err.message };
  }
}

module.exports = {
  crawlUrlAndVectorize: async ({ url }) => {
    try {
      console.log('starting crawling the url: ', url);
      const crawledData = await crawlUrl({ url });
      if (!crawledData?.ok || crawledData?.data.length === 0) {
        return { ok: false, err: crawledData.err };
      }
      const crawledContent = Object.values(crawledData.data);
      console.log('Done with Crawling and preprocessing the url');
      console.log('Vectorizing started');
      const vector = await vectorizeText({ text: crawledContent });
      if (!vector.ok) {
        return { ok: false, err: vector.err };
      }
      console.log('Vectorizing done');
      console.log('inserting in qdrant');
      const insertedVector = await insertVector({
        content: crawledContent,
        vector: vector.data,
      });
      if (!insertedVector.ok) {
        return { ok: false, err: insertedVector.err };
      }
      console.log('insertion in qdrant done successfully');
      return { ok: true, data: 'Data Crawling Completed' };
    } catch (err) {
      console.error(
        'Error in crawlerService: crawlUrlAndVectorize:',
        err.stack
      );
      return { ok: false, err: err.message };
    }
  },

  askQuery: async ({ question }) => {
    try {
      console.log('preprocessing the question: ', question);
      const preprocessedText = preprocessText({ text: question });
      console.log('preprocessing done: ');
      console.log('Starting vectorization for ', question);
      const vector = await vectorizeText({ text: [preprocessedText] });
      if (!vector.ok) {
        return { ok: false, err: vector.err };
      }
      console.log('vectorization done');
      console.log('searching in qdrant');
      const response = await searchVector({ vector: vector.data, topN: TopN });
      if (!response.ok) {
        return { ok: false, err: response.err };
      }
      return { ok: true, data: 'Success' };
    } catch (err) {
      console.error('Error in crawlerService: askQuery:', err.stack);
      return { ok: false, err: err.message };
    }
  },
};
