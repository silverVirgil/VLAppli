var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

/* Insert one new user into database. */
router.route('/').post(function (req, res) {
    var path = req.originalUrl.split('?')[0];
    var type = req.method; console.log('req.originalUrl : ', req.originalUrl);
    req.body._id = new ObjectId();
    global.schemas[global.actions_json[type + path].model].create([req.body], function (err, result) {
        if (err) { throw err; } global.schemas[global.actions_json[type + path].model].find({ _id: req.body._id }, function (err, result2) {
            console.log('Inserted data : ', result);
            if (global.actions_json[type + path].return_type == null) {
                res.render(global.actions_json[type + path].view, { title: 'Creating User without error with datas below :', data: result2 });
            } else {
                res.send(result2); // renvoie les données insérée pour confirmation
            }
        });
    } // fin callback de l'insert
    ); // fin de l'insert() 
}); // fin de la gestion de la route module.exports = router;