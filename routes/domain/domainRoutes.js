const routers = require('express').Router();

const {
  createDomain,
  getDomainRecords,
  getDomains,
  addDomainRecord,
  deleteDomainRecord,
  editDomainRecord,
} = require('../../controllers/Domain/Domain');
const router = require('../user/userRoutes');

routers.post('/create-domain', createDomain);
routers.get('/get-domains', getDomains);
routers.get('/get-domain-records/:domain/:zoneId', getDomainRecords);
routers.post('/add-domain-records', addDomainRecord);
routers.post('/delete-domain-records', deleteDomainRecord);
routers.post('/edit-domain-records', editDomainRecord);

module.exports = routers;
