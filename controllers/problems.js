'use strict'

const Problem = require('../models').problems
const Submission = require('../models').submissions
const Category = require('../models').categories
const User = require('../models').users
const Grader = require('../controllers/grader')
const _ = require('lodash')
const files = require('../services/files')

const Sequelize = require('sequelize')
const Op = Sequelize.Op

/**
 * Problems controller 
 */

function create(req, res) {
    if (req.user.usertype == 0) {
        return res.status(401).send({ error: 'No se encuentra autorizado' })
    }

    req.body = req.body.data

    if ((!req.body.title_es && !req.body.title_en) || (!req.body.description_en && !req.body.description_es) ||
        !req.body.category || !req.body.level || !req.body.example_input || !req.body.example_output || !req.body.time_limit) {
        return res.status(400).send({ error: 'Datos incompletos' })
    }

    req.body.category_id = req.body.category
    req.body.input = req.files['input'][0].path
    req.body.output = req.files['output'][0].path
    req.body.userId = req.user.sub
    req.body.user_id = req.user.sub

    Problem.create(req.body)
        .then(problem => {
            return res.sendStatus(201)
        })
        .catch(error => {
            console.error(error)
            error = _.omit(error, ['parent', 'original', 'sql'])
            return res.status(400).send(error)
        })
}

function update(req, res) {
    if (req.user.usertype == 0) {
        return res.status(401).send({ error: 'No se encuentra autorizado' })
    }
    req.body = req.body.data
    let condition = {
        id: req.params.id
    }

    if (req.user.usertype == 1) {
        condition.user_id = req.user.sub
    }

    req.body.category_id = req.body.category

    if (req.files['input'] || req.files['output']) {
        if (req.files['input']) req.body.input = req.files['input'][0].path
        if (req.files['output']) req.body.output = req.files['output'][0].path
        findFiles(req, res, condition)
    } else {
        makeUpdate(req, res, condition)
    }
}

function findFiles(req, res, condition) {
    Problem.findByPk(req.params.id).then(problem => {
        if (req.files['input']) req.body.oldInput = problem.input
        if (req.files['output']) req.body.oldOutput = problem.output

        makeUpdate(req, res, condition)
    }).catch((err) => {
        return res.sendStatus(500)
    })
}

function makeUpdate(req, res, condition) {
    Problem.update(
        req.body, {
            where: condition
        }
    ).then((affectedRows) => {
        if (affectedRows) {
            if (req.body.oldInput) files.removeFile(req.body.oldInput)
            if (req.body.oldOutput) files.removeFile(req.body.oldOutput)

            return res.status(200).send(req.body)
        }
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    }).catch((err) => {
        return res.sendStatus(500)
    })
}

function remove(req, res) {
    if (req.user.usertype == 0) {
        return res.status(401).send({ error: 'No se encuentra autorizado' })
    }

    let condition = {
        id: req.params.id
    }

    if (req.user.usertype == 1) {
        condition.user_id = req.user.sub
    }

    Problem.destroy({
            where: condition
        })
        .then(function(deletedRecords) {
            if (deletedRecords) return res.status(200).json(deletedRecords);
            return res.status(401).send({ error: 'No se encuentra autorizado' })
        })
        .catch(function(error) {
            return res.status(500).json(error);
        });
}

function get(req, res) {
    Problem.findOne({
            where: {
                id: req.params.id
            },
            include: [
                { model: User, attributes: ['name', 'id', 'username', 'email'] },
                {
                    model: Submission,
                    as: 'submissions',
                    attributes: ['user_id'],
                    where: {
                        user_id: req.user.sub,
                        verdict: 'Accepted'
                    },
                    required: false
                },
                { model: Category, attributes: ['name', 'id', 'type'] },
            ],
            attributes: ['id', 'title_es', 'title_en', 'level', 'description_en', 'description_es',
                'example_input', 'example_output', 'category_id', 'user_id', 'time_limit'
            ]
        })
        .then((problem) => {
            return res.status(200).send({ problem })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })
}

function list(req, res) {
    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let order = []
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let by = (req.query.by) ? req.query.by : 'ASC'

    let condition = {}
    let meta = {}

    // Barra de búsqueda o búsqueda de problemas por categoria 
    if (req.params.id) {
        condition.category_id = req.params.id
        if (req.query.filter) {
            if (req.query.filter == 'en') {
                condition.title_en = {
                    [Op.ne]: null
                }
            } else {

                condition.title_es = {
                    [Op.ne]: null
                }
            }
        }
    } else if (!req.query.search)
        return res.status(400).send({ error: 'No se ha proporcionado un termino para buscar' })
    else {

        req.query.search = '%' + req.query.search + '%'
        if (req.query.filter) {
            if (req.query.filter == 'en') {
                condition.title_en = {
                    [Op.ne]: null
                }

                condition[Op.or] = [{
                        title_en: {
                            [Op.like]: req.query.search
                        }
                    },
                    {
                        description_en: {
                            [Op.like]: req.query.search
                        }
                    }
                ]
            } else {
                condition.title_es = {
                    [Op.ne]: null
                }

                condition[Op.or] = [{
                        title_es: {
                            [Op.like]: req.query.search
                        }
                    },
                    {
                        description_es: {
                            [Op.like]: req.query.search
                        }
                    },
                ]
            }
        } else {
            condition[Op.or] = [{
                    title_en: {
                        [Op.like]: req.query.search
                    }
                },
                {
                    title_es: {
                        [Op.like]: req.query.search
                    }
                },
                {
                    description_en: {
                        [Op.like]: req.query.search
                    }
                },
                {
                    description_es: {
                        [Op.like]: req.query.search
                    }
                },
            ]
        }
    }

    if (req.query.sort) {
        if (req.query.sort == 'name')
            if (req.query.filter && req.query.filter == 'es')
                order[0] = ['title_es', by]
            else order[0] = ['title_en', by]
        else
            order[0] = ['level', by]
    } else order[0] = ['id', by]

    if (req.params.id) {
        Category.findByPk(req.params.id).then(category => {
            if (!category) return res.sendStatus(404)

            meta.categoryName = category.name

            Problem.findAndCountAll({
                where: condition,
                distinct: 'id',
                attributes: ['id', 'title_es', 'title_en', 'level'],
                include: [{
                    model: Submission,
                    as: 'submissions',
                    attributes: ['user_id'],
                    where: {
                        user_id: req.user.sub,
                        verdict: 'Accepted'
                    },
                    required: false
                }],
                limit: limit,
                order: order,
                offset: offset,
            }).then((response) => {
                meta.totalPages = Math.ceil(response.count / limit)
                meta.totalItems = response.count

                if (offset >= response.count) {
                    return res.status(200).send({ meta })
                }
                res.status(200).send({ meta: meta, data: response.rows })
            })
        }).catch((err) => {
            res.sendStatus(500)
        })
    } else {

        Problem.findAndCountAll({
            where: condition,
            distinct: 'id',
            attributes: ['id', 'title_es', 'title_en', 'level'],
            limit: limit,
            include: [{
                model: Submission,
                as: 'submissions',
                attributes: ['user_id'],
                where: {
                    user_id: req.user.sub,
                    verdict: 'Accepted'
                },
                required: false
            }],
            order: order,
            offset: offset,
        }).then((response) => {
            meta.totalPages = Math.ceil(response.count / limit)
            meta.totalItems = response.count

            if (offset >= response.count) {
                return res.status(200).send({ meta })
            }
            res.status(200).send({ meta: meta, data: response.rows })
        }).catch((err) => {
            res.sendStatus(500)
        })
    }
}

function submit(req, res) {
    if (req.user.usertype == 2)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    req.body = req.body.data

    console.log("************** INFORMACION DE LOS ARCHIVOS *****************");
    console.log(req.files)

    if (!req.files['code'] || !req.body.language)
        return res.status(400).send({ error: 'Datos incompletos' })

    req.body.user_id = req.user.sub
    req.body.problem_id = req.params.id
    req.body.status = 'in queue'

    //archivo que se evalua
    const fileNameExecution =  req.files['code'][0].filename
    const filePathExecution = req.files['code'][0].path
    req.body.file_name = fileNameExecution
    req.body.file_path = filePathExecution

    if(req.files['svgBlocklyCode']){
        console.log('svg COOOooooooooooooooooooooooooooooooooooooODE', req.files['svgBlocklyCode'])
        req.body.blockly_file_name = req.files['svgBlocklyCode'][0].filename
    }
    
    let isContest = false
    if (req.body.contest_problem_id) isContest = true

    Submission.create(req.body)
        .then(submission => {
        
            Grader.judge(submission.id, isContest, fileNameExecution, filePathExecution)
            return res.status(200).send(submission)
        })
        .catch(error => {
            error = _.omit(error, ['parent', 'original', 'sql'])
            return res.status(400).send(error)
        })
}

/**
 * obtener tipo de categoría del problema (colegio, univercisad)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function validateCategory(req, res){

    Category.findOne({
        attributes: [
            'type'
        ],
        include: [
            {
                model: Problem,
                as: 'problems',
                attributes: ['id', 'category_id'],
                where: {
                    id: req.params.id,
                }
            }
        ]
    })
        .then((category) => {
            return res.status(200).send({ type: category.type })
        })
        .catch((err) => {
            return res.status(500).send({ error: `${err}` })
        })

    return true
}

module.exports = {
    create,
    update,
    remove,
    list,
    get,
    submit,
    validateCategory
}