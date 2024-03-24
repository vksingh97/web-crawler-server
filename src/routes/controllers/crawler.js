const crawlerService = require('../../services/crawler');

module.exports = {
  crawlUrlAndVectorize: async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.invalid({ msg: 'url is required' });
      }
      const response = await crawlerService.crawlUrlAndVectorize({ url });
      if (response.ok) {
        return res.success({ data: response.data });
      }
      return res.failure({ msg: response.err });
    } catch (err) {
      console.error('error in crawlUrlAndVectorize:', err.stack);
      return res.failure({ msg: err.message });
    }
  },

  askQuery: async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.invalid({ msg: 'question is required' });
      }
      const response = await crawlerService.askQuery({ question });
      if (response.ok) {
        return res.success({ data: response.data });
      }
      return res.failure({ msg: response.err });
    } catch (err) {
      console.error('error in askQuery:', err.stack);
      return res.failure({ msg: err.message });
    }
  },
};
