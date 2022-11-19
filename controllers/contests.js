'use strict'

const Contest = require('../models').contests
const Enums = require('../helpers/enums')
const ContestProblems = require('../models').contests_problems
const Submissions = require('../models').submissions
const Problem = require('../models').problems
const User = require('../models').users
const Institution = require('../models').institutions
const ContestStudent = require('../models').contests_students
const _ = require('lodash')
const moment = require('moment')

const env = process.env.NODE_ENV || "development"
const config = require('../config/config.js')[env]

const Sequelize = require('sequelize')
const sequelize = new Sequelize(config.url, config)

const {categories: Category} = require("../models");
const Op = Sequelize.Op

/**
 * Contests controller
 */
function create(req, res) {
    if (!req.body.title || !req.body.description || !req.body.init_date || !req.body.end_date || !req.body.rules)
        return res.status(400).send({ error: 'Datos incompletos' })

    if (req.body.public == false && !req.body.key)
        return res.status(400).send({ error: 'No se asignó una contraseña para la maraton' })

    if (req.body.public == true)
        req.body.key = null

    let start = moment(req.body.init_date)
    let end = moment(req.body.end_date)

    if (start < moment())
        return res.status(400).send({ error: 'La fecha de inicio de la maraton debe ser mayor a la fecha actual' })

    if (end.diff(start, 'minutes') < 30)
        return res.status(400).send({ error: 'La duración mínima de la maraton debe ser 30 minutos' })

    req.body.user_id = req.user.sub

    Contest.create(req.body)
        .then(category => {
            return res.sendStatus(201)
        })
        .catch(error => {
            console.error(error)
            error = _.omit(error, ['parent', 'original', 'sql'])
            return res.status(500).send(error)
        })
}

function index(req, res) {
    Contest.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: User,
                attributes: ['name', 'id', 'username', 'email']
            }],
            attributes: ['id', 'title', 'description', 'init_date', 'end_date', 'rules', 'public','type', 'key']
        })
        .then((contest) => {
            return res.status(200).send({ contest })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function update(req, res) {
    if (!req.body.title || !req.body.description || !req.body.init_date || !req.body.end_date || !req.body.rules)
        return res.status(400).send({ error: 'Datos incompletos' })

    if (!req.body.public && !req.body.key)
        return res.status(400).send({ error: 'No se asignó una contraseña para el syllabus' })

    if (req.body.public == true)
        req.body.key = null

    let start = moment(req.body.init_date)
    let end = moment(req.body.end_date)

    if (start < moment())
        return res.status(400).send({ error: 'La fecha de inicio de la maraton debe ser mayor a la fecha actual' })

    if (end.diff(start, 'minutes') < 30)
        return res.status(400).send({ error: 'La duración mínima de la maraton debe ser 30 minutos' })

    req.body.user_id = req.user.sub
    Contest.findByPk(req.params.id).then(contest => {
        let init_date = moment(contest.init_date)
        let end_date = moment(contest.end_date)

        if (init_date < moment() && start != init_date)
            return res.status(400).send({ error: 'No se puede cambiar la fecha de inicio de una maraton que ya inició' })

        if (end_date < moment() && end != end_date)
            return res.status(400).send({ error: 'No se puede cambiar la fecha de fin de una maraton que ya acabó' })

        if (contest.user_id != req.body.user_id)
            return res.status(401).send({ error: 'No se encuentra autorizado' })

        Contest.update(
            req.body, {
                where: { id: req.params.id }
            }
        ).then(updated => {
            return res.status(200).send(req.body)
        }).catch((err) => {
            console.error(err)
            return res.sendStatus(500)
        })
    }).catch((err) => {
        console.error(err)
        return res.sendStatus(500)
    })
}

function remove(req, res) {
    Contest.findByPk(req.params.id).then(contest => {
        if (contest == null)
            return res.sendStatus(404)

        if (contest.user_id != req.user.sub)
            return res.status(401).send({ error: 'No se encuentra autorizado' })

        if (contest.init_date < moment())
            return res.status(400).send({ error: 'No se puede eliminar una maraton que ya inició' })

        ContestProblems.destroy({
            where: { contest_id: req.params.id }
        }).then(success => {
            Contest.destroy({
                    where: { id: req.params.id }
                })
                .then(function(deletedRecords) {
                    return res.status(200).json(deletedRecords);
                }).catch((err) => {
                    return res.sendStatus(500)
                })
        }).catch((err) => {
            return res.sendStatus(500)
        })

    }).catch((err) => {
        return res.sendStatus(500)
    })
}

function getProblems(req, res) {
    Contest.findOne({
        where: { id: req.params.id },
        include: [{
            model: Problem,
            as: 'problems',
            attributes: ['id', 'title_es', 'title_en', 'level'],
            through: { attributes: ['id'] },
            include: [{
                model: Submissions,
                as: 'submissions',
                attributes: ['id', 'user_id', 'assignment_problem_id', 'contest_problem_id'],
                where: {
                    user_id: req.user.sub,
                    verdict: 'Accepted',
                    contest_problem_id: {
                        $ne: null
                    }
                },
                required: false
            }]
        }]
    }).then((contest) => {
        if (contest == null) return res.sendStatus(404)
        return res.status(200).send({ contest })
    }).catch((err) => {
        return res.status(500).send({ error: `${err}` })
    })
}

/**
 * Agregar problemas a la maratón
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function addProblems(req, res) {
    if (!req.body.problems)
        return res.status(400).send({ error: 'Datos incompletos' })

    Contest.findByPk(req.params.id)
        .then((contest) => {
            if (contest == null)
                return res.sendStatus(404)

            if (contest.user_id != req.user.sub)
                return res.status(401).send({ error: 'No se encuentra autorizado' })

            let init_date = moment(contest.init_date)

            if (init_date < moment())
                return res.status(400).send({ error: 'No se puede modificar una maraton que ya inició' })

                const contest_problems = []
                const contest_type = Enums.typeContest.getName(contest.type)
                
                //validar que el tipo de maratón sea correspondiente al tipo de problema que va a guardar
                var validate_problems = new Promise((resolve, reject) => {
                    req.body.problems.forEach((problem_id, index, array) => {
                        Problem.findOne({
                            where: {
                                id: problem_id
                            },
                            include: [
                                { model: Category, attributes: ['name', 'id', 'type'] },
                            ]
                        })
                        .then((problem) => {
                            const problem_type = Enums.typeCategory.getName(problem.category.type)
                            
                            if(problem_type !== contest_type){
                               
                                const contest_type_spanish = Enums.typeContest.getNameSpanish(contest.type)

                                reject ({status:400, error: 'No se puede agregar un problema de tipo diferente en una maratón de '+ contest_type_spanish})
                            }
                            
                            
                            contest_problems.push({problem_id: problem_id, contest_id: contest.id});

                            if (index === array.length -1){
                                resolve()
                            }

                        }).catch((err) => {
                            console.error(err)
                            reject({status:500, error: err})
                        })
                    })
                })
                
                validate_problems.then((validate) => {
                    ContestProblems.bulkCreate(contest_problems).then((problems) =>{
                        return res.sendStatus(201)
                    }).catch((err) => {
                        console.error(err)
                        return res.sendStatus(500)
                    })
                }).catch((err) =>{
                    console.error(err)
                    return res.status(err.status).send({ error: err.error })
                })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function removeProblems(req, res) {
    if (!req.body.problems)
        return res.status(400).send({ error: 'Datos incompletos' })

    Contest.findByPk(req.params.id)
        .then((contest) => {
            if (contest == null)
                return res.sendStatus(404)

            if (contest.user_id != req.user.sub)
                return res.status(401).send({ error: 'No se encuentra autorizado' })

            let init_date = moment(contest.init_date)

            if (init_date < moment())
                return res.status(400).send({ error: 'No se puede modificar una maraton que ya inició' })

            contest.removeProblems(req.body.problems).then((problems) => {
                return res.sendStatus(201)
            }).catch((err) => {
                return res.sendStatus(500)
            })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function registerStudent(req, res) {
    if (req.user.usertype != 0)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    Contest.findByPk(req.params.id)
        .then((contest) => {
            if (contest == null)
                return res.sendStatus(404)

            if (!contest.public && !req.body.key)
                return res.status(400).send({ error: 'Datos incompletos' })

            if (!contest.public && req.body.key != contest.key)
                return res.status(401).send({ error: 'Clave de la maratón incorrecta' })

            let end_date = moment(contest.end_date)

            if (end_date < moment())
                return res.status(400).send({ error: 'No se puede registrar en una maraton que ya acabo' })

            const contest_student = {user_id: req.user.sub, contest_id: contest.id}

            ContestStudent.create(contest_student).then((user) => {
                return res.sendStatus(201)
            }).catch((err) => {
                console.error(err)
                return res.sendStatus(500)
            })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function removeStudent(req, res) {
    if (req.user.usertype != 0)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    Contest.findByPk(req.params.id)
        .then((contest) => {
            if (contest == null)
                return res.sendStatus(404)

            let end_date = moment(contest.end_date)

            if (end_date < moment())
                return res.status(400).send({ error: 'No se puede desregistrar en una maraton que ya acabo' })

            contest.removeUsers(req.user.sub).then((user) => {
                return res.sendStatus(201)
            }).catch((err) => {
                return res.sendStatus(500)
            })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function list(req, res) {
    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let by = (req.query.by) ? req.query.by : 'DESC'
    let orderQuery = (req.query.order)
    let orderF = null;
    if(orderQuery){
        switch (orderQuery){
            case "Id": orderF="id"
                break;
            case "Nombre": orderF="title"
                break;

        }
    }else{
        orderF="id"
    }

    let order = [];

    order[0] = [orderF, by]
    let condition = {}
    let meta = {}

    if (req.query.user)
        condition.user_id = req.query.user
    else
        condition.id = {
            [Op.ne]: null
        }
    if (req.query.type){
        condition.type = req.query.type
    }
    if (req.query.filter) {
        if (req.query.filter == 'private') condition.public = false
        else condition.public = true
    }

    if (req.query.status) {
        if (req.query.status == 'running') {
            condition.init_date = {
                [Op.lte]: moment()
            }
            condition.end_date = {
                [Op.gte]: moment()
            }
        } else if (req.query.status == 'past') {
            condition.end_date = {
                [Op.lt]: moment()
            }
        } else {
            condition.init_date = {
                [Op.gt]: moment()
            }
        }
    }

    Contest.findAndCountAll({
        where: condition,
        include:
            [
                { model: User, attributes: ['name', 'id', 'username','email'] },
            ],
        attributes: ['id', 'title', 'description', 'init_date', 'end_date', 'rules', 'public', 'key', 'type'],
        limit: limit,
        offset: offset,
        order: order
    }).then((response) => {
        meta.totalPages = Math.ceil(response.count / limit)
        meta.totalItems = response.count

        if (offset >= response.count) {
            return res.status(200).send({ meta })
        }
        res.status(200).send({ meta: meta, data: response.rows })
    }).catch((err) => {
        console.error(err)
        return res.status(500).send({ error: `${err}` })
    })
}

function isRegister(req, res) {
    if (!req.query.student)
        return res.status(400).send({ error: 'Datos incompletos' })

    ContestStudent.findOne({
            where: {
                contest_id: req.params.id,
                user_id: req.query.student
            },
            attributes: ['id']
        }).then(response => {
            let status = 'registered';

            if (!response) status = 'unregistered'
            return res.status(200).send({ status: status })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function hasPermission(user_id, contest_id, cb) {
    Contest.findOne({
        where: { id: contest_id }
    }).then((contest) => {
        if (contest.public) return cb(null, true)
        if (contest.user_id == user_id) return cb(null, true)

        ContestStudent.findOne({
                where: {
                    contest_id: contest_id,
                    user_id: user_id
                },
                attributes: ['id']
            }).then(response => {
                if (!response) return cb(null, false)
                return cb(null, true)
            })
            .catch((err) => {
                return cb(err, null)
            })
    }).catch((err) => {
        return cb(err, null)
    })
}

function getContestsByInstitution(req, res){
    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let idInstitution = req.params.idInstitution;

    let condition = {}
    let meta = {}

    condition.institution_id = idInstitution

    sequelize.query(
        'select distinct contests.id, contests.title, contests.public, contests.init_date from contests as contests' +
        " inner join contests_problems as cprob on cprob.contest_id = contests.id " +
        "inner join submissions as submissions on cprob.id = submissions.contest_problem_id " +
        "inner join users as users on submissions.user_id = users.id && users.institution_id =" +idInstitution+
        " group by contests.id, submissions.id, users.id order by contests.id " +
        " LIMIT "+ offset+ ", "+limit, {   type: Sequelize.QueryTypes.SELECT }
    )
    .then((response) => {
        meta.totalItems = response.length
        meta.totalPages = Math.ceil(response.length / limit)

        if (offset >= response[0].count) {
            return res.status(200).send({ meta })
        }
        res.status(200).send({ meta: meta, data: response})
    }).catch((err) => {
        return res.status(500).send({ error: `${err}` })
    })
}

module.exports = {
    create,
    index,
    list,
    update,
    remove,
    getProblems,
    addProblems,
    removeProblems,
    registerStudent,
    removeStudent,
    isRegister,
    hasPermission,
    getContestsByInstitution
}