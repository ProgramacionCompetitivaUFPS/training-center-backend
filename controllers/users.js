'use strict'

const User = require('../models').users
const Institutions = require('../models').institutions
const Submissions = require('../models').submissions
const Syllabus = require('../models').syllabuses
const Problems = require('../models').problems
const Categories = require('../models').categories
const authService = require('../services/authenticationService')
const path = require('path')
const _ = require('lodash');
const {categories: Category, sequelize} = require("../models");

/**
 * Users controller
 */

function removeAccounts(req, res) {
    if (req.user.usertype != 2)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    if (!req.body.users)
        return res.status(400).send({ error: 'Datos incompletos' })

    User.destroy({
        where: {
            id: req.body.users
        }
    })
        .then(function(deletedRecords) {
            return res.status(200).json(deletedRecords);
        })
        .catch(function(error) {
            return res.status(500).json(error);
        });
}
/**
 * List all the users
 * @param {any} req
 * @param {any} res
 */
function index(req, res) {

    if (req.user.usertype != 2)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0

    let condition = {}
    let meta = {}

    if (req.query.type)
        condition.type = req.query.type
    else
        condition.id = { $ne: null }

    let by =  req.query.by;
    let orderQuery = (req.query.sort)
    let orderF = null;
    if(orderQuery){
        switch (orderQuery){
            case "Id": orderF="id"
                break;
            case "Nombre": orderF="name"
                break;
            case "Código": orderF="code"
                break;
            case "Usuario": orderF="username"

        }
    }else{
        orderF="id"
    }
    let order = [];

    order[0] = [orderF, by]

    User.findAndCountAll({
        attributes: ['id', 'name', 'email', 'code', 'type', 'username'],
        include: [
            { model: Institutions , as:"institution",
                attributes:['id','name', 'country','telephone','address','shortName'],
                required: false,
            }
        ],
        limit: limit,
        offset: offset,
        order:order
    }).then((response) => {
        meta.totalPages = Math.ceil(response.count / limit)
        meta.totalItems = response.count

        if (offset >= response.count) {
            return res.status(200).send({ meta })
        }
        res.status(200).send({ meta: meta, data: response.rows })
    }).catch((err) => {
        return res.status(500).send({ error: `${err}` })
    })
}

/**
 * Registers an student user
 * @param {any} req
 * @param {any} res
 */
function register(req, res) {
    req.body.type = 0
    User.create(req.body)
        .then(user => {
            return res.sendStatus(201)
        })
        .catch(error => {
            console.err(error)
            error = _.omit(error, ['parent', 'original', 'sql'])
            return res.status(400).send(error)
        })
}

/**
 * Register an Admin or Coach user
 * @param {any} req
 * @param {any} res
 * @returns
 */
function signUp(req, res) {
    if (req.user.usertype != 2 || req.body.type == 0) {
        return res.status(401).send({ error: 'No se encuentra autorizado' })
    }

    User.create(req.body)
        .then(user => {
            return res.sendStatus(201)
        })
        .catch(error => {
            error = _.omit(error, ['parent', 'original', 'sql'])
            return res.status(400).send(error)
        })
}

function getUser(req, res) {
    User.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id', 'name', 'email', 'code', 'username', 'created_at'],
        include: [
            { model: Institutions ,as:"institution",
                attributes: ["id", "name"]
            }
        ]
    }).then(function(user) {
        return res.status(200).send(user)
    }).catch(function(err) {
        return res.sendStatus(500)
    })
}

/**
 * Updates the user's password
 * @param {any} req
 * @param {any} res
 * @returns
 */
function recovery(req, res) {
    if (!req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(400).send({ error: 'Datos incompletos' })
    }

    authService.invalidateToken(req.body.token)

    User.update({
        password: req.body.password,
        confirm_password: req.body.confirmPassword
    }, {
        where: {
            email: req.body.email
        },
        fields: ['password', 'confirm_password'],
        individualHooks: true
    }).then((affectedRows) => {
        if (affectedRows) return res.sendStatus(200)

        return res.status(400).send({ error: 'Datos incorrectos' })
    }).catch((err) => {
        return res.status(500).send({ error: `Ocurrió un error al restablecer la contraseña: ${err}` })
    })
}

function update(req, res) {
    if (req.params.id != req.user.sub)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    if (!req.body.name || !req.body.email || !req.body.username || !req.body.institution)
        return res.status(400).send({ error: 'Datos incompletos' })

    let condition = {
        id: req.params.id
    }

    let {institution,  ...cuerpo} = req.body;
    cuerpo.institution_id = institution.id;

    User.update(
        cuerpo, {
            where: condition
        }
    ).then((affectedRows) => {
        if (affectedRows > 0) return res.status(200).send(req.body)
        return res.status(401).send({ error: 'No se encuentra autorizado' })
    }).catch((err) => {
        return res.sendStatus(500)
    })
}

function changePassword(req, res) {
    if (req.params.id != req.user.sub)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    if (!req.body.password || !req.body.confirm_password || !req.body.old_password)
        return res.status(400).send({ error: 'Datos incompletos' })

    User.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(user) {
        if (user.authenticate(req.body.old_password)) {
            User.update(
                req.body, {
                    where: { id: req.params.id },
                    fields: ['password', 'confirm_password'],
                    individualHooks: true
                }
            ).then((affectedRows) => {
                if (affectedRows) return res.sendStatus(200)

                return res.status(400).send({ error: 'Datos incorrectos' })
            }).catch((err) => {
                return res.status(400).send({ error: "Error, las contraseñas no coinciden" })
            })
        } else
            res.status(401).send({ error: 'Contraseña incorrecta' })
    }).catch(function(err) {
        return res.sendStatus(500)
    })
}

function getSyllabus(req, res) {

    User.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id'],
        include: [{
            model: Syllabus,
            as: 'syllabuses',
            attributes: ['id'],
            where: {
                type: req.query.type
            },
            through: { attributes: [] }
        }]
    }).then((ans) => {
        if (ans == null) return res.sendStatus(404)
        let user = {}
        user.id = ans.id
        user.syllabuses = ans.syllabuses.map(s => s.id)
        return res.status(200).send({ user })
    }).catch((err) => {
        return res.status(500).send({ error: `${err}` })
    })
}

function getSubmissions(req, res) {

    if (!req.query.page)
        return res.status(400).send({ error: 'Datos incompletos' })

    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let order = []
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let by = (req.query.by) ? req.query.by : 'DESC'

    let condition = {
        user_id: req.params.id
    }
    let meta = {}

    order[0] = ['created_at', by]

    if (req.query.sort) {
        if (req.query.sort == 'time') order[0] = ['execution_time', by]
        else if (req.query.sort == 'level') order[0] = [Problems, 'level', by]
    }

    if (req.query.condition) {
        if (req.query.condition == 'WA') condition.verdict = 'Wrong Answer'
        else if (req.query.condition == 'TL') condition.verdict = 'Time Limit Exceeded'
        else if (req.query.condition == 'RT') condition.verdict = 'Runtime Error'
        else if (req.query.condition == 'CE') condition.verdict = 'Compilation Error'
        else condition.verdict = 'Accepted'
    }

    Submissions.findAndCountAll({
        where: condition,
        include: [
            { 
                model: Problems, 
                attributes: ['title_en', 'id', 'title_es', 'level'],
                include: [{
                    model: Categories,
                    attributes: ['name', 'type'],
                    required: true
                }] 
            }
        ],
        attributes: ['id', 'language', 'file_name', 'execution_time', 'verdict', 'status', 'created_at', 'blockly_file_name'],
        limit: limit,
        order: order,
        offset: offset,
    })
        .then((response) => {
            meta.totalPages = Math.ceil(response.count / limit)
            meta.totalItems = response.count

            if (offset >= response.count)
                return res.status(200).send({ meta })
            return res.status(200).send({ meta: meta, data: response.rows })
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).send({ error: `${err}` })
        })
}

function getSubmission(req, res) {
    return res.sendFile(path.join(path.dirname(__dirname), 'files', 'codes', req.params.submission))
}

function getSubmissionLog(req, res) {
    const fs = require('fs');
    const filePath = path.join(path.dirname(__dirname), 'files', 'errors', req.params.submission);

    try {
        if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
        } else {
        return undefined
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
}

function getSubmissionsbyContest(req, res) {

    if(req.user.usertype === 0){
        return res.status(401).send({ error: 'No se encuentra autorizado' });
    }

    sequelize.query(`SELECT s.id, s.language, s.file_name, s.execution_time, s.verdict, s.status, s.created_at, s.user_id, s.blockly_file_name,
    p.id as pid, p.title_en, p.title_es, p.level,
    cp.contest_id,
    us.name, us.username
    FROM submissions as s, contests_problems as cp, problems as p, users as us
    WHERE s.contest_problem_id = cp.id
    and p.id = s.problem_id
    AND cp.contest_id =  ${req.query.cid}
    and s.user_id = ${req.query.usrid}
    and us.id = ${req.query.usrid}
    ORDER BY s.created_at DESC`).then((response) => {
        response.count;
        return res.status(200).send({
            cantidad: response[0].length,
            datos: response[0],
        });
    })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        });
}


function getUserByInstitution(req, res){
    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let idInstitution = req.params.idInstitution;

    let condition = {}
    let meta = {}

    condition.institution_id = idInstitution

    User.findAndCountAll({
        attributes: ['id', 'name', 'email', 'code', 'type', 'username'],
        include: [
            { model: Institutions ,as:"institution",
                required: false,
            }
        ],
        where: condition,
        limit: limit,
        offset: offset
    }).then((response) => {
        meta.totalPages = Math.ceil(response.count / limit)
        meta.totalItems = response.count

        if (offset >= response.count) {
            return res.status(200).send({ meta })
        }
        res.status(200).send({ meta: meta, data: response.rows })
    }).catch((err) => {
        return res.status(500).send({ error: `${err}` })
    })
}
function getSvgSubmission(req, res) {
    return res.sendFile(path.join(path.dirname(__dirname), 'files', 'codes','blockly_svg_sources', req.params.submission))
}


module.exports = {
    index,
    register,
    signUp,
    recovery,
    changePassword,
    update,
    getSyllabus,
    removeAccounts,
    getSubmissions,
    getSubmission,
    getSubmissionLog,
    getUser,
    getUserByInstitution,
    getSubmissionsbyContest,
    getSvgSubmission
}