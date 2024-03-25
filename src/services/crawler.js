const puppeteer = require('puppeteer');
const { OpenAIEmbeddings, OpenAI } = require('@langchain/openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { loadQAStuffChain } = require('langchain/chains');
const { Document } = require('@langchain/core/documents');

const { createChunksAndEmbeddings } = require('./vectorize');

const { insertVectorsIntoPinecone } = require('./pinecone');

const crawlSinglePageContent = async ({ url }) => {
  try {
    url = url.trim();
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    console.log(`Started crawling to ${url}..`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const title = await page.title();
    let content = await page.$eval('body', (body) => body.textContent.trim());
    content = content.replace(/\s/g, ' ');

    await browser.close();

    return { ok: true, data: { title, content, url } };
  } catch (err) {
    console.error('Error in crawlUrl:', err.message);
    return { ok: false, err: err.message };
  }
};

const askChatGpt = async ({ response, question }) => {
  const llm = new OpenAI({});
  const chain = loadQAStuffChain(llm);
  const scrapedPageContent = response.matches
    .map((match) => match.metadata.pageContent)
    .join(' ');
  const result = await chain.invoke({
    input_documents: [new Document({ pageContent: scrapedPageContent })],
    question,
  });

  console.log(`Answer: ${result.text}`);
  return result.text;
};

module.exports = {
  crawlUrlAndVectorize: async ({ url }) => {
    try {
      console.log('Crawling URL:', url);
      const crawledData = await crawlSinglePageContent({ url });
      if (!crawledData?.ok || !crawledData?.data) {
        return { ok: false, err: 'No data crawled' };
      }

      const vectorizedData = await createChunksAndEmbeddings({ crawledData });

      const pinecone = new Pinecone();
      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
      await insertVectorsIntoPinecone({
        vectorizedData,
        crawledData,
        pineconeIndex,
      });

      return { ok: true, data: 'Data Crawling Completed' };
    } catch (err) {
      console.error('Error in crawlUrlAndVectorize:', err.stack);
      return { ok: false, err: err.message };
    }
  },

  askQuery: async ({ question }) => {
    try {
      console.log('Asking Pinecone');
      const pinecone = new Pinecone();
      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

      const openAiQueryEmbedding = await new OpenAIEmbeddings().embedQuery(
        question
      );

      let response = await pineconeIndex.query({
        topK: 3,
        vector: openAiQueryEmbedding,
        includeValues: true,
        includeMetadata: true,
      });
      console.log(`Found ${response.matches.length} matches`);

      let queryAnswer = '';

      if (response.matches.length) {
        queryAnswer = await askChatGpt({ response, question });
      }
      return { ok: true, data: queryAnswer };
    } catch (err) {
      console.error('Error in askQuery:', err.stack);
      return { ok: false, err: err.message };
    }
  },
};
