const router = require('express').Router();
const { checkAuth } = require('../../controllers/Authentication/auth');

router.get('/me', checkAuth);

module.exports = router;
