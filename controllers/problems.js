'use strict'
const env = process.env.NODE_ENV || "development"
const config = require('../config/config.js')[env]
const Problem = require('../models').problems
const Submission = require('../models').submissions
const Category = require('../models').categories
const User = require('../models').users
const path = require('path')
const Grader = require('../controllers/grader')
const _ = require('lodash')
const files = require('../services/files')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(config.url, config)
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

function getDataFile(req, res) {
    return res.sendFile(path.join(path.dirname(__dirname), 'files', req.params.folder, req.params.filename))
}

function getSubmissions(req, res) {
    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let order = []
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let by = (req.query.by) ? req.query.by : 'ASC'
    let condition = {}
    let meta = {}
    let language = (req.query.filter && req.query.filter == 'es') ? 'es':'en'

    let order_sql="s.id"

    if (req.query.sort) {
        if (req.query.sort == 'language'){
            order_sql="s.language"
        }
        if (req.query.sort == 'name'){
            order_sql="u.name"
        }
        if (req.query.sort == 'verdict'){
            order_sql="s.verdict"
        }
    } else order[0] = ['id']

    if (req.params.id) {
        condition.id = req.params.id
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
    }


    if (req.params.id) {
        Problem.findByPk(req.params.id).then(problem => {
            if (!problem) return res.sendStatus(404)
            meta.title = problem.dataValues.title_es==null?problem.dataValues.title_en:problem.dataValues.title_es
            meta.level=problem.dataValues.level

            sequelize.query(
                'SELECT count(s.id) AS `count` from submissions s' +
                    ' WHERE s.problem_id= :id',{replacements:{id:req.params.id}, type: Sequelize.QueryTypes.SELECT }
            ).then(response => {
                meta.totalPages = Math.ceil(response[0].count / limit)
                meta.totalItems = response[0].count
        
                if (offset >= response[0].count)
                    return res.status(200).send({ meta })
                

                sequelize.query(
                    `select s.id, u.name , u.username, s.language,s.execution_time , s.verdict, s.created_at, s.file_name
                    from submissions s 
                    inner join problems p on p.id = s.problem_id
                    left join users u on u.id = s.user_id
                    where p.id = :id   
                    ORDER BY `+order_sql+` `+by+`
                    LIMIT `+ offset + ', ' + limit, { replacements: {id:req.params.id, limit: limit,offset: offset}, 
                    type: Sequelize.QueryTypes.SELECT,
                    }
                ).then(response => {
                    const formattedResponse = response.map(row => formatSubmission(row));
                    res.status(200).send({ meta: meta, data: formattedResponse });
                  }).catch(error => {
                    return res.status(500).send(error);
                  });
            }).catch(error => {
                return res.status(500).send(error)
            })})

    }
}
function list(req, res) {
    let limit = (req.query.limit) ? parseInt(req.query.limit) : 10
    let order = []
    let offset = (req.query.page) ? limit * (parseInt(req.query.page) - 1) : 0
    let by = (req.query.by) ? req.query.by : 'ASC'
    let typeCategory = (req.query.typeCategory)
    let language = (req.query.filter && req.query.filter == 'es') ? 'es':'en'

    let condition = {}
    let meta = {}
    let order_sql="problems.id"

    if (req.query.sort) {
        if (req.query.sort == 'name'){
            if (language ==='es'){
                order_sql="problems.title_es"
            }
            else {
                order_sql="problems.title_en"
            }
        }
        if (req.query.sort == 'approval_rate'){
            order_sql="approval_rate"
        }
        if (req.query.sort == 'submissions'){
            order_sql="submission_count"
        }
    }
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
    } else if (!req.query.search){
        return res.status(400).send({ error: 'No se ha proporcionado un termino para buscar' })
    }else{

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

    if(typeCategory){
        condition.category_id = {
            [Op.in]: Sequelize.literal(
              `(SELECT id FROM categories 
               WHERE type = ${typeCategory})`
            ),
          };
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

            sequelize.query(
                'SELECT count(DISTINCT(`problems`.`id`)) AS `count` ' +
                    'FROM `problems` AS `problems` ' +
                    'LEFT OUTER JOIN `submissions` AS `submissions` ON `problems`.`id` = `submissions`.`problem_id` ' +
                    'AND `submissions`.`verdict` = \'Accepted\' ' +
                    'INNER JOIN `users` AS `user` ON `problems`.`user_id` = `user`.`id` ' +
                    'INNER JOIN `categories` AS `category` ON `problems`.`category_id` = `category`.`id` ' +
                    'WHERE `problems`.`category_id` = :category',{ replacements: { category:req.params.id},type: Sequelize.QueryTypes.SELECT }
            ).then(response => {
                meta.totalPages = Math.ceil(response[0].count / limit)
                meta.totalItems = response[0].count
        
                if (offset >= response[0].count)
                    return res.status(200).send({ meta })
                
                sequelize.query(
                    `SELECT problems.*,
                        COUNT(submissions.id) AS submission_count,
                        (SUM(CASE WHEN submissions.verdict = 'Accepted' THEN 1 ELSE 0 END) / COUNT(submissions.id)) * 100 AS approval_rate
                    FROM
                        (SELECT problems.id,
                            problems.input,
                            problems.output,
                            problems.title_es,
                            problems.title_en,
                            problems.level,
                            user.id AS 'userid',
                            user.name AS 'username',
                            user.username AS 'userusername',
                            category.id AS 'categoryid',
                            category.name AS 'categoryname',
                            category.type AS 'categorytype'
                        FROM problems AS problems
                        INNER JOIN users AS user ON problems.user_id = user.id
                        INNER JOIN categories AS category ON problems.category_id = category.id
                        WHERE problems.category_id = :category
                        GROUP BY problems.id
                        ORDER BY :order :by
                        ) AS problems
                    LEFT OUTER JOIN submissions AS submissions ON problems.id = submissions.problem_id
                    GROUP BY problems.id
                    ORDER BY `+order_sql+` `+by+`
                    LIMIT `+ offset + ', ' + limit, { replacements: { limit: limit,offset: offset,order:order.join(','),by:by, category:req.params.id}, 
                    type: Sequelize.QueryTypes.SELECT,
                    model: Problem,
                    mapToModel: true }
                ).then(response => {
                    const formattedResponse = response.map(row => formatProblem(row));
                    res.status(200).send({ meta: meta, data: formattedResponse });
                  }).catch(error => {
                    return res.status(500).send(error);
                  });
            }).catch(error => {
                console.log(error)
                return res.status(500).send(error)
            })})

    } else {

        Problem.findAndCountAll({
            where: condition,
            distinct: 'id',
            attributes: ['id', 'title_es', 'title_en', 'level', 'user_id', 'category_id','input', 'output'],
            limit: limit,
            include: [
              {
                model: Submission,
                as: 'submissions',
                attributes: ['user_id'],
                where: {
                  verdict: 'Accepted'
                },
                required: false
              },
              {
                model: User,
                attributes: ['id', 'name'],
                required: true
              },
              {
                model: Category,
                attributes: ['id', 'name', 'type'],
                required: true
              }
            ],
            order: order,
            offset: offset,
          })
            .then((response) => {
                  const meta = {
                    totalPages: Math.ceil(response.count / limit),
                    totalItems: response.count,
                  };
          
                  if (offset >= response.count) {
                    return res.status(200).send({ meta });
                  }
          
                  res.status(200).send({ meta: meta, data: response.rows });
                })
            .catch((err) => {
              console.error(err);
              res.sendStatus(500);
            });
    }          
}


function submit(req, res) {
    if (req.user.usertype == 2)
        return res.status(401).send({ error: 'No se encuentra autorizado' })

    req.body = req.body.data

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
function formatProblem(row) {
    return {
      id: row.dataValues.id,
      title_es: row.dataValues.title_es,
      input: row.dataValues.input,
      output: row.dataValues.output,
      title_en: row.dataValues.title_en,
      level: row.dataValues.level,
      approval_rate: row.dataValues.approval_rate,
      submission_count: row.dataValues.submission_count,
      user:{
        name: row.dataValues.userusername,
        username: row.dataValues.username,
      },
      submissions: [],
      category: {
        id: row.dataValues.categoryid,
        name: row.dataValues.categoryname,
        type: row.dataValues.categorytype
      }
    };
  }
  
function formatSubmission(row) {
    return {
      id: row.id,
      language: row.language,
      execution_time: row.execution_time,
      file_name: row.file_name,
      verdict: row.verdict,
      created_at: row.created_at,
      user:{
        name: row.username,
        username: row.name,
      }
    };
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
    getDataFile,
    submit,
    validateCategory,
    getSubmissions
}
