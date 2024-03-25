const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings, OpenAI } = require('@langchain/openai');

const createChunksAndEmbeddings = async ({ crawledData }) => {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const chunks = await textSplitter.createDocuments([crawledData.data.content]);

  const embeddings = await new OpenAIEmbeddings().embedDocuments(
    chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' '))
  );
  console.log(`Creating ${chunks.length} vectors array`);

  return { chunks, embeddings };
};

module.exports = { createChunksAndEmbeddings };
