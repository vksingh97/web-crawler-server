# Webcrawler


1.Puppeteer: This is a headless Chrome browser library that allows your backend to automate web browsing and scraping data from websites. It essentially acts as a web crawler that can fetch specific content from URLs. <br />
2.LangChain: This is a library or framework for processing text data. It likely helps you break down the scraped content into meaningful units (tokens) for further analysis. <br />
3.Pinecone: This is a vector database service. It's optimized for storing and efficiently searching high-dimensional data like the OpenAI embeddings you generate. These embeddings represent the "meaning" of the text data in a numerical form, enabling fast similarity searches. <br />
4.OpenAI LLM (Large Language Model): This refers to a powerful language model from OpenAI, capable of processing and understanding large amounts of text data. In your application, it likely takes the retrieved content and the user's query, analyzes them, and generates a comprehensive response. <br />



1.Data Acquisition: Puppeteer scrapes content from relevant websites. <br />
2.Text Processing: LangChain helps break down the scraped text into meaningful units. <br />
3.Embedding Generation: OpenAI likely generates numerical representations (embeddings) for the processed text. <br />
4.Embedding Storage & Retrieval: Pinecone stores these embeddings and facilitates similarity searches based on user queries. <br />
5.Response Generation: The OpenAI LLM utilizes retrieved content and the user's query to formulate an informative response. <br />


.env <br />
PORT=3001 <br />
MONGO_URI= <br />
JWT_SECRET_KEY= <br />
OPENAI_API_KEY= <br />
PINECONE_API_KEY= <br />
PINECONE_ENVIRONMENT= <br />
PINECONE_INDEX= <br />

Start application <br /> 
npm run start
