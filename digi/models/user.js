'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({

    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    phone: Number,
    pin: String,
    rapidID: String,
    created_at: String,
    temp_pin: Number,
    temp_pin_time: String,
    orgname: String,
    orgcontact: Number,

});


mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/digitalId', { useMongoClient: true });

mongoose.connect('mongodb://rpqb:rpqb123@ds131583.mlab.com:31583/digitalid', { useMongoClient: true });



module.exports = mongoose.model('user', userSchema);