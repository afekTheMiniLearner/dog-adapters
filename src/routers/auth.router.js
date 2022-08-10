const express = require('express');
const router = express.Router();
const { loginCtrl } = require('../controllers/auth.controller');

router.post('/login', loginCtrl);

module.exports = router;
