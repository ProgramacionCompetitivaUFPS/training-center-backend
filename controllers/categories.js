"use strict";

const Category = require("../models").categories;
const Material = require("../models").material;
const _ = require("lodash");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

/**
 * Categories controller
 */

/**
 * List all the users
 * @param {any} req
 * @param {any} res
 */
function index(req, res) {
  let condition = {};

  if (req.query.type) {
    condition.type = {
      [Op.or]: [req.query.type, 3],
    };
  }

  if (req.query.material) {
    condition.id = Sequelize.literal( //USAR SUBQUERY
      "SELECT category_id from Materials where id = ",
      req.query.material
    );
  }

  Category.findAll({
    where: condition,
  })
    .then((categories) => {
      return res.status(200).send({ categories });
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).send({ error: `${err}` });
    });
}

function index2(req, res) {
  Category.findAll({})
    .then((categories) => {
      return res.status(200).send({ categories });
    })
    .catch((err) => {
      return res.status(500).send({ error: `${err}` });
    });
}

function create(req, res) {
  if (req.user.usertype != 2) {
    return res.status(401).send({ error: "No se encuentra autorizado" });
  }
  if (!req.body.name || !req.body.type_category) {
    return res.status(400).send({ error: "Datos incompletos" });
  }

  req.body.type = req.body.type_category;
  Category.create(req.body)
    .then((category) => {
      return res.sendStatus(201);
    })
    .catch((error) => {
      console.log(error);
      error = _.omit(error, ["parent", "original", "sql"]);
      return res.status(400).send(error);
    });
}

function remove(req, res) {
  if (req.user.usertype != 2) {
    return res.status(401).send({ error: "No se encuentra autorizado" });
  }

  Category.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(function (deletedRecords) {
      res.status(200).json(deletedRecords);
    })
    .catch(function (error) {
      res.status(500).json(error);
    });
}

function update(req, res) {
  if (req.user.usertype != 2) {
    return res.status(401).send({ error: "No se encuentra autorizado" });
  }

  Category.update(
    {
      name: req.body.name,
    },
    {
      where: {
        id: req.params.id,
      },
      fields: ["name"],
    }
  )
    .then((affectedRows) => {
      if (affectedRows)
        return res.status(200).send({ id: req.params.id, name: req.body.name });
    })
    .catch((err) => {
      return res.sendStatus(500);
    });
}

/**
 * obtener categoría por material
 * @param {*} req
 * @param {*} res
 * @returns
 */
function findByMaterial(req, res) {
  console.log("ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
  let condition = {};
  condition.id = Sequelize.literal(
    `SELECT category_id from Materials where id = ${req.params.materialId}`)
  Category.findOne({
    where:
      condition,
  })
    .then((category) => {
      return res.status(200).send({ type: category.type });
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).send({ error: `${err}` });
    });

  return true;
}

module.exports = {
  index,
  index2,
  create,
  remove,
  update,
  findByMaterial
};
