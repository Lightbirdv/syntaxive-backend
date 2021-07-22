var mongoose = require('mongoose')
const config = require('../config/default.json');
let _db;

function initDb(callback) {
    if (_db) {
        if (callback) {
            return callback(null, _db);    
        } else {
            return _db;
        }
    } else {
        mongoose.connect(config.db.connectionString, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
        _db = mongoose.connection;
        _db.on('error', console.error.bind(console, 'connection error; '));
        _db.once('open', function() {
            console.log('initStep: Connected to database ' + config.db.connectionString + ' in DB.js: ' + _db);
            callback(null, _db);
        });
    }
}

function getDb() {
    return _db;
}

module.exports = {
    getDb,
    initDb
};