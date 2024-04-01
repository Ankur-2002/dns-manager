const userModels = require('../../models/User');
const joi = require('joi');
const dns = require('oci-dns');
const identity = require('oci-identity');
const common = require('oci-common');
const catchAsync = require('../../helpers/catchAsync');

const provider = new common.ConfigFileAuthenticationDetailsProvider(
  'E:\\dns-manager\\.oci\\config',
);
const dnsClient = new dns.DnsClient({
  authenticationDetailsProvider: provider,
});
const client = new identity.IdentityClient({
  authenticationDetailsProvider: provider,
});

const createDomain = catchAsync(async (req, res) => {
  const schema = joi.object({
    name: joi.string().min(3).required(),
    zoneType: joi.string().min(3).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, zoneType } = req.body;
  let compartmentId = req.user.compartmentId;
  const { _id } = req.user;

  if (!compartmentId) {
    const compartment = await client.createCompartment({
      createCompartmentDetails: {
        name: _id,
        description: 'dns-manager of ' + name + ' domains',
        compartmentId: process.env.TENANCY_ID,
      },
    });

    console.log(compartment);

    compartmentId = compartment.compartment.id;
    await userModels.findByIdAndUpdate(_id, { compartmentId });
  }

  console.log(compartmentId);
  const createZone = await dnsClient.createZone({
    createZoneDetails: {
      name: name,
      zoneType: zoneType.toUpperCase(),
      compartmentId: compartmentId.toString(),
    },
  });

  res.json({
    message: 'Domain created successfully',
    domain: createZone,
  });
});

const getDomains = catchAsync(async (req, res) => {
  if (!req.user.compartmentId) {
    return res.status(200).json({ domain: [] });
  }

  const zones = await dnsClient.listZones({
    compartmentId: req.user.compartmentId,
  });

  res.json({
    message: 'Domains fetched successfully',
    domains: zones,
  });
});

const getDomainRecords = catchAsync(async (req, res) => {
  const schema = joi.object({
    zoneId: joi.string().min(3).required(),
    domain: joi.string().min(3).required(),
  });

  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const zone = await dnsClient.getDomainRecords({
    zoneNameOrId: req.params.zoneId,
    domain: req.params.domain,
  });

  res.json({
    message: 'Domain records fetched successfully',
    records: zone,
  });
});

const addDomainRecord = catchAsync(async (req, res) => {
  const schema = joi.object({
    zoneId: joi.string().required(),
    domain: joi.string().required(),
    rtype: joi.string().required(),
    rvalue: joi.string().required(),
    ttl: joi.number(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { zoneId, domain, rtype, rvalue } = req.body;
  const record = await dnsClient.patchDomainRecords({
    zoneNameOrId: zoneId,
    domain: domain,
    patchDomainRecordsDetails: {
      items: [
        {
          domain: domain,
          rtype: rtype,
          rdata: rvalue,
          ttl: req.body.ttl || 60,
        },
      ],
    },
  });

  res.json({
    message: 'Record added successfully',
    record: record,
  });
});

const deleteDomainRecord = catchAsync(async (req, res) => {
  const schema = joi.object({
    zoneId: joi.string().required(),
    domain: joi.string().required(),
    recordHash: joi.string().required(),
    rtype: joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { zoneId, domain, recordHash, rtype } = req.body;
  const record = await dnsClient.deleteRRSet({
    zoneNameOrId: zoneId,
    domain: domain,
    recordHash: recordHash,
    rtype: rtype,
  });

  res.json({
    message: 'Record deleted successfully',
    record: record,
  });
});

const editDomainRecord = catchAsync(async (req, res) => {
  const schema = joi.object({
    zoneId: joi.string().required(),
    domain: joi.string().required(),
    recordHash: joi.string().required(),
    rtype: joi.string().required(),
    rvalue: joi.string().required(),
    ttl: joi.number(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { zoneId, domain, recordHash, rtype, rvalue } = req.body;
  const record = await dnsClient.updateRRSet({
    zoneNameOrId: zoneId,
    domain: domain,
    recordHash: recordHash,
    rtype: rtype,
    updateRRSetDetails: {
      items: [
        {
          domain: domain,
          rtype: rtype,
          rdata: rvalue,
          ttl: req.body.ttl || 60,
        },
      ],
    },
  });

  res.json({
    message: 'Record updated successfully',
    record: record,
  });
});
module.exports = {
  createDomain,
  getDomainRecords,
  getDomains,
  addDomainRecord,
  deleteDomainRecord,
  editDomainRecord,
};
