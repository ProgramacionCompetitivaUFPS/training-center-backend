'use strict'

const institutions = require('../models').institutions
const authService = require('../services/authenticationService')
const path = require('path')
const _ = require('lodash');
const {where} = require("sequelize");
/**
 * institutions controller
 */

/**
 * List all the institutions
 * @param {any} req
 * @param {any} res
 */
function getUniversities(req, res){
    institutions.findAll({
        where:{
            type:0
        }
    })
        .then((universities) => {

            return res.status(200).send({universities})
        })
        .catch((err) => {
            return res.status(500).send({ error:`${err}`})
        })
}

function getColleges(req, res){
    institutions.findAll({
        where:{
            type:1
        }
    })
        .then((universities) => {

            return res.status(200).send({universities})
        })
        .catch((err) => {
            return res.status(500).send({ error:`${err}`})
        })
}

module.exports = {
    getUniversities,
    getColleges
}
