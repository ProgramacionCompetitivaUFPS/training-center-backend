'use strict'

const express = require('express')
const institutions = express.Router()
const instCtrl = require('../controllers/institutions')
const auth = require('../middlewares/auth')

/**
 * Handler for '/institutions' routes
 */
institutions.get('/universities', auth.isAuth, instCtrl.getUniversities)
institutions.get('/colleges', auth.isAuth, instCtrl.getColleges)


module.exports = institutions;
