const express = require('express');
const path = require('path');
const routes = require('./routes/routes');

const app = express();
const port = process.env.PORT || 6001;

app.use(express.text({ limit: '25mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(routes);
app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
