const { QdrantClient } = require('@qdrant/qdrant-js');
const { CollectionName } = require('../utils/constants');

async function insertVector({ content, vector }) {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_KEY,
    });
    const collectionName = CollectionName;
    const result = await client.getCollections();
    const collectionExists = result.collections.some(
      (collection) => collection.name === collectionName
    );
    if (!collectionExists) {
      console.log('Collection not found, creating:', collectionName);
      await client.createCollection(collectionName, {
        vectors: {
          size: vector.length,
          distance: 'Cosine',
        },
      });
    }
    await client.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: Date.now(),
          vector,
          payload: {
            content,
          },
        },
      ],
    });
    console.log('vector inserted successfully');
    return { ok: true, data: 'Vector inserted successfully!' };
  } catch (err) {
    console.error('Error inserting vector:', err.stack);
    return { ok: false, err: err.message };
  }
}

async function searchVector({ vector, topN }) {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_KEY,
    });
    const collectionName = CollectionName;
    console.log('collectionName is:', collectionName);
    console.log('topN is:', topN);
    console.log('vector is:', vector);
    const response = await client.search(collectionName, {
      vector,
      limit: topN,
      withPayload: true,
      withVectors: true,
      scoreThreshold: 0.5,
      filter: null,
      offset: 0,
      vectorFilters: null,
    });
    console.log('this response:', JSON.stringify(response, null, 2));
    return {
      ok: true,
      data: response,
    };
  } catch (err) {
    console.error('Error in searchVector service:', err);
    return { ok: false, err: err.message };
  }
}

module.exports = {
  insertVector,
  searchVector,
};
