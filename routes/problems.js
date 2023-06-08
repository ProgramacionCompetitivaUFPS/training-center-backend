'use strict'

const express = require('express')
const problems = express.Router()
const problemsCtrl = require('../controllers/problems')
const auth = require('../middlewares/auth')
const multer = require('multer')
const uploader = require('../services/uploader')

var upload = multer({
    storage: uploader.multer_storage,
    fileFilter: uploader.problemsDataFilter
})

var problemUpload = upload.fields([
    { name: 'input', maxCount: 1 },
    { name: 'output', maxCount: 1 }
])

var submissionCode = multer({
    storage: uploader.multer_storage,
    fileFilter: uploader.submissionsDataFilter
})

var submissionUploadCode = submissionCode.fields([
    { name: 'code', maxCount: 1 },
    { name: 'svgBlocklyCode', maxCount: 1 }
])


/**
 * Handler for '/problems' routes
 */

problems.get('/:id', auth.isAuth, problemsCtrl.get )
problems.get('/:id/:folder/:filename', auth.isAuth, problemsCtrl.getDataFile )
problems.get('/:id/validateCategory', auth.isAuth, problemsCtrl.validateCategory )
problems.get('/', auth.isAuth, problemsCtrl.list )
problems.post('/:id/submit', auth.isAuth, submissionUploadCode, problemsCtrl.submit )
problems.post('/', auth.isAuth, problemUpload, problemsCtrl.create )
problems.put('/:id', auth.isAuth, problemUpload, problemsCtrl.update)
problems.delete('/:id', auth.isAuth, problemsCtrl.remove )

module.exports = problems;
