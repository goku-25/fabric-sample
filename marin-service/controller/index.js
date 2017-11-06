var express = require('express');
var router = express.Router();
router.use('/marine', require('./insert'));
module.exports = router;