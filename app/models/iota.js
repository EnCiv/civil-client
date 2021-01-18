'use strict'
const Joi = require('@hapi/joi')
const MongoModels = require('mongo-models')

const schema = Joi.object({
  _id: Joi.object(),
  path: Joi.string(),
  subject: Joi.string().required(),
  description: Joi.string().required(),
  webComponent: [Joi.string(), Joi.object()],
  participants: Joi.object(),
  component: Joi.object(),
  userId: Joi.string(),
  parentId: Joi.string(),
  bp_info: Joi.object(),
})

class Iota extends MongoModels {
  static load(objs) {
    if (Iota._load)
      Iota._load = Iota._load.concat(objs)
    else if (!MongoModels.dbs['default'])
      Iota._load = objs
    else
      Iota._write_load(objs)
  }
  static _write_load(objs) {
    return new Promise(async (ok, ko) => {
      if (process.env.NODE_ENV !== 'production') {
        // convert object _id's to objects
        objs.forEach(i => {
          i._id = Iota.ObjectID(i._id.$oid)
        })
        logger.info('Iota.init updating for development')
        for await (const doc of objs) {
          try {
            const result = await Iota.replaceOne({ _id: doc._id }, doc, { upsert: true })
            if (typeof result !== 'object' || result.length !== 1) {
              logger.error('Iota.init result not ok', result, 'for', doc)
              // don't through errors here-  keep going
            }
          } catch (err) {
            logger.error('Iota.init caught error trying to replaceOne for', err, 'doc was', doc)
            // don't through errors here - just keep going
          }
        }
      }
    })
  }
  static create(obj) {
    return new Promise(async (ok, ko) => {
      try {
        const doc = new Iota(obj)
        const result = await this.insertOne(doc)
        if (result && result.length === 1) ok(result[0])
        else {
          const msg = `unexpected number of results received ${results.length}`
          logger.error(msg)
          ko(new Error(msg))
        }
      } catch (err) {
        logger.error(`Iota.create caught error:`, err)
        ko(err)
      }
    })
  }
}

Iota.collectionName = 'iotas' // the mongodb collection name
Iota.schema = schema

function init() {
  return new Promise(async (ok, ko) => {
    try {
      await Iota.createIndexes([
        { key: { path: 1 }, name: 'path', unique: true, partialFilterExpression: { path: { $exists: true } } },
        {
          key: { parentId: 1, 'component.component': 1, _id: -1 },
          name: 'children',
          partialFilterExpression: { parentId: { $exists: true }, 'component.component': { $exists: true } },
        },
      ])
      var count = await Iota.count()
      logger.info('Iota.init count', count)
      if (!(Iota._load && (process.env.NODE_ENV !== 'production' || !count))) return ok()
      // if development, or if production but nothing in the database
      await Iota._write_load(Iota._load)
      delete Iota._load
      return ok()
    } catch (err) {
      logger.error('Iota.createIndexes error:', err)
      return ko(err)
    }
  })
}

if (MongoModels.dbs['default']) init()
else if (MongoModels.toInit) MongoModels.toInit.push(init)
else MongoModels.toInit = [init]

module.exports = Iota
