const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('../src/connections/mongodb');
const routes = require('../src/routes/routes');
const { initialisePinecone } = require('./connections/pincone');
const reponseHandlers = require('../src/routes/middlewares/response');
initialisePinecone();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(bodyParser.json());
app.use(reponseHandlers);
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
