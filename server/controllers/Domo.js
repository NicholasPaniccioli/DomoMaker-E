const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

const models = require ('../models');
const Domo = models.Domo;

let DomoModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const DomoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },

    age: {
        type: Number,
        min: 0,
        required: true,
    },

    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },

    createdData: {
        type: Date,
        default: Date.now,
    },
});

DomoSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    age: doc.age,
});

DomoSchema.statics.findByOwner = (ownerId, callback) => {
    const search = {
        owner: convertId(ownerId),
    };

    return DomoModel.find(search).select('name age').lean().exec(callback);
};

DomoModel = mongoose.model('Domo', DomoSchema);

const makerPage = (req, res) => {
    res.render('app');
};

const makeDomo = (req, res) => {
    if(!req.body.name || !req.body.age) {
        return res.status(400).json({error: 'RAWR! Both name and age are required'});
    }

    const domoData = {
        name: req.body.name,
        age: req.body.age,
        owner: req.session.account._id,
    };

    const newDomo = new Domo.DomoModel(domoData);

    const domoPromise = newDomo.save();

    domoPromise.then(() => res.json({ redirect: '/maker'}));

    domoPromise.catch((err) => {
        console.log(err);
        if(err.code === 11000){
            return res.status(400).json({error: 'Domo already exists'});
        }

        return res.status(400).json({error: 'An error occurred'});
    });

    return domoPromise;
};

module.exports.DomoModel = DomoModel;
module.exports.DomoSchema = DomoSchema;
module.exports.makerPage = makerPage;
module.exports.make = makeDomo;