const express = require('express');
const app = express();
const dotenv=require("dotenv");
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

dotenv.config();

const connect =  async() => {
    try {
     await mongoose.connect(process.env.URL,{ useNewUrlParser: true,useUnifiedTopology: true });
      console.log("Connected to mongoDB.");
    } catch (error) {
      throw error;
    }
  };

const { UrlModel } = require('./models/urlshort');
// Midleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    let allUrl = UrlModel.find(function (err, result) {
        res.render('home', {
            urlResult: result
        })
    })
});

app.post('/create', function (req, res) {
    let urlShort = new UrlModel({
        longUrl: req.body.longurl,
        shortUrl: generateUrl()
    })

    urlShort.save(function (err, data) {
        if (err) throw err;
        res.redirect('/');
    })
});


app.get('/:urlId', function (req, res) {
    UrlModel.findOne({ shortUrl: req.params.urlId }, function (err, data) {
        if (err) throw err;

        UrlModel.findByIdAndUpdate({ _id: data.id }, { $inc: { clickCount: 1 } }, function (err, updatedData) {
            if (err) throw err;
            res.redirect(data.longUrl)
        })


    })
})

app.get('/delete/:id',function(req,res){
    UrlModel.findByIdAndDelete({_id:req.params.id},function(err,deleteData){
        if(err) throw err;
        res.redirect('/')
    })
})

const port=process.env.PORT||3000;

app.listen(port, function () {
    connect();
    console.log('Port is running in 3000')
});

function generateUrl() {
    var rndResult = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for (var i = 0; i < 5; i++) {
        rndResult += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    console.log(rndResult)
    return rndResult
}