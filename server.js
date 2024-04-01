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

const findZone = async () => {
  const provider = new common.ConfigFileAuthenticationDetailsProvider(
    'E:\\dns-manager\\.oci\\config',
  );
  const dnsClient = new dns.DnsClient({
    authenticationDetailsProvider: provider,
  });
  const client = new identity.IdentityClient({
    authenticationDetailsProvider: provider,
  });

  const res = await client.getCompartment({
    compartmentId:
      'ocid1.compartment.oc1..aaaaaaaaoaynj35l4zysrwbaq3nkn3oyvndezfneban5nbxdfgxkj3z6akla',
    // 'ocid1.tenancy.oc1..aaaaaaaaegagrop5mk7oxxol25xj44ty44sjib73quroyins5h72jdocevna',
  });
  const zone = await dnsClient.listZones({
    // compartmentId:
    //   'ocid1.compartment.oc1..aaaaaaaaoaynj35l4zysrwbaq3nkn3oyvndezfneban5nbxdfgxkj3z6akla',
    compartmentId:
      'ocid1.compartment.oc1..aaaaaaaaoaynj35l4zysrwbaq3nkn3oyvndezfneban5nbxdfgxkj3z6akla',
    // 'ocid1.tenancy.oc1..aaaaaaaaegagrop5mk7oxxol25xj44ty44sjib73quroyins5h72jdocevna',
  });

  // const createZone = await dnsClient.createZone({
  //   createZoneDetails: {
  //     name: 'ankurchaurasia.com',
  //     zoneType: 'PRIMARY',
  //     compartmentId:
  //       'ocid1.compartment.oc1..aaaaaaaaoaynj35l4zysrwbaq3nkn3oyvndezfneban5nbxdfgxkj3z6akla',
  //     // 'ocid1.tenancy.oc1..aaaaaaaaegagrop5mk7oxxol25xj44ty44sjib73quroyins5h72jdocevna',
  //   },
  // });
  const getDomainRecords = await dnsClient.getDomainRecords({
    zoneNameOrId:
      'ocid1.dns-zone.oc1..aaaaaaaakxau6mxbyn2tvo4rnzxu5ptiodnerztcyipgyaps2ppud2ealn7q',
    domain: 'ankurchaurasia.com',
  });
  console.log(res, zone, JSON.stringify(getDomainRecords));
  // const resp = await client.createCompartment({
  //   createCompartmentDetails: {
  //     name: 'test',
  //     description: 'test',
  //     compartmentId:
  //       'ocid1.tenancy.oc1..aaaaaaaaegagrop5mk7oxxol25xj44ty44sjib73quroyins5h72jdocevna',
  //   },
  // });
  const request = {
    compartmentId:
      'ocid1.compartment.oc1..aaaaaaaaoaynj35l4zysrwbaq3nkn3oyvndezfneban5nbxdfgxkj3z6akla',
    zoneNameOrId:
      'ocid1.dns-zone.oc1..aaaaaaaachkdi5nawsduehhzgowg6mdthp3x4zzjeplbz3xcnqzt2cax7zxa',
  };

  // dnsClient.getZone(request).then(response => {
  //   console.log(response);
  // });

  // dnsClient
  //   .getDomainRecords({
  //     zoneNameOrId:
  //       'ocid1.dns-zone.oc1..aaaaaaaachkdi5nawsduehhzgowg6mdthp3x4zzjeplbz3xcnqzt2cax7zxa',
  //     domain: 'ankurchaurasia.in',
  //   })
  //   .then(response => {
  //     console.log(JSON.stringify(response));
  //   });
};

// findZone();
