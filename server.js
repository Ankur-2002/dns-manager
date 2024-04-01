require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const dbConfig = require('./config/database.config.js');
const userRoutes = require('./routes/user/userRoutes.js');
const userAuth = require('./routes/user/userAuthRoutes.js');
const domainRoutes = require('./routes/domain/domainRoutes.js');
const dns = require('oci-dns');
const identity = require('oci-identity');
const common = require('oci-common');
const authenticateMiddleware = require('./middleware/Authentication.js');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Database
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });

// Routes
app.use('/api/auth', userAuth);
app.use('/api/auth', authenticateMiddleware, userRoutes);
app.use('/api/domain', authenticateMiddleware, domainRoutes);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// findZone();
