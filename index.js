const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const { ObjectID, ObjectId } = require('mongodb');
const fileUpload = require('express-fileupload');

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());
app.use(express.static('courseImg'));
app.use(fileUpload());
const port = 5000

app.get("/", (req, res) => {
  res.send("Ariful Islam")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ifnyo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const coursesCollection = client.db("drivingSchool").collection("courses");
  const bookingCollection = client.db("drivingSchool").collection("bookingCourses");
  const reviewCollection = client.db("drivingSchool").collection("review");

  app.post('/addCourse', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    console.log(name, price, file);
    const path = `${__dirname}/courseImg/${file.name}`;
    file.mv(path, err => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "failed to upload img" })
      }
      return res.send({ name: file.name, path: `/${file.name}` })
    })
  })

  app.post('/review', (req, res) => {
    const review = req.body;
    console.log(review);
    reviewCollection.insertOne(review)
    .then(result => {
      res.send(result)
    })
  });


  app.get('/getReview', (req, res) => {
    reviewCollection.find({})
    .toArray((err, document) => {
      res.send(document)
    })
  }) 
    

  app.post('/booking', (req, res) => {
    const bookingdData = req.body;
    console.log(bookingdData);
    bookingCollection.insertOne(bookingdData)
    .then(result => {
      console.log(result);
      //res.send(result)
    })
  })


  app.get('/orderedCourse', (req, res) => {
    bookingCollection.find({})
    .toArray((err, document) => {
      res.send(document)
    })
  });

  app.post('/bookingList', (req, res) => {
    const email = req.body
    bookingCollection.find({email:email.email})
    .toArray((err, document) => {
       res.send(document);
     })
  })

      app.delete("/delete/:id", ( req, res) => {
        console.log(ObjectId(req.params.id));
        bookingCollection.deleteOne({_id:ObjectId(req.params.id)})
        .then(result => {
          console.log(result);
            res.send("succes", result)
        })
    })

//console.log(err ? err.message : 'Database connected!')
});

app.listen(process.env.PORT || port) 