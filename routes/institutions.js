'use strict'

const express = require('express')
const institutions = express.Router()
const instCtrl = require('../controllers/institutions')

/**
 * Handler for '/institutions' routes
 */
institutions.get('/universities', instCtrl.getUniversities)
institutions.get('/colleges', instCtrl.getColleges)


module.exports = institutions;
