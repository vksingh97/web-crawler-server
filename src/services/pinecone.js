const insertVectorsIntoPinecone = async ({
  vectorizedData,
  crawledData,
  pineconeIndex,
}) => {
  const batchSize = 100;
  let batch = [];
  for (let i = 0; i < vectorizedData.chunks.length; i++) {
    const chunk = vectorizedData.chunks[i];
    const id = `${crawledData.data.title}_${Date.now()}_${i}`;
    const vector = {
      id,
      values: vectorizedData.embeddings[i],
      metadata: {
        title: crawledData.data.title,
        url: crawledData.data.url,
        pageContent: chunk.pageContent,
      },
    };
    batch.push(vector);
    if (batch.length === batchSize || i === vectorizedData.chunks.length - 1) {
      await pineconeIndex.upsert(batch);
      batch = [];
    }
  }
};
module.exports = { insertVectorsIntoPinecone };
