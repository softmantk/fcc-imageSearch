/**
 * Created by SOFTMAN on 25-04-2017.
 */
var express = require('express')
var mongodb = require('mongodb').MongoClient;
var logger = require('morgan')
var path = require('path')
var moment = require('moment');
var url = 'mongodb://localhost:27017/imagesearch';
var bodyParser = require('body-parser')
const GoogleImages = require('google-images')
var app = express();

var date = moment().format("DD MM YYYY - hh:mm:ss a");
var page = 1;

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({
    extended : false
}));


console.log("server running ....")

app.get('/search/:id', function (req, res) {

    const client = new GoogleImages('010621396975509520882:pjbwbgmb6ao', 'AIzaSyARgMDzJDagnnuJ-AVWd4CILdGA_gy-d6g' );
    var imageresults = [];
    var search = req.params.id;
    if(req.query.offset) {
        page  = parseInt(req.query.offset);
    }

    client.search(search, {
        page : page
    }).then(function (images) {
        //console.log("results: ", images);
        imageresults = images;
        res.send(imageresults)
    });

    mongodb.connect(url, function (err, db) {
        if(err)
            throw err
        var collection = db.collection('searchHistory');
        collection.insertOne({
            query: search,
            time : date
        });

    });

});
app.get('/history',function (req, res) {
    mongodb.connect(url, function (err, db) {
        if(err)
            throw err
        var collection = db.collection('searchHistory');
        collection.find({}).sort({time : -1}).toArray(function (err, data) {
            if(err)
                throw err
            console.log(data)
            res.send(data)
        })

    })

});


// For 404 page not found

app.use(function (req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.end("page not found");
});
app.listen(process.env.PORT || 3000);

