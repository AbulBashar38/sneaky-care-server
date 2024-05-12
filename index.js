const express = require("express");
const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const { ObjectID, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozftyhw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    client.connect().then(() => {
      console.log("Connected to MongoDB");

      const database = client.db(`${process.env.DB_NAME}`);
      const productCollection = database.collection("allProduct");
      const serviceCollection = database.collection("services");
      const orderCollection = database.collection("Orders");
      const testimonialCollection = database.collection("testimonials");
      const adminCollection = database.collection("admins");
      const appointmentCollection = database.collection("appointment");
      const bookingAppointmentCollection =
        database.collection("bookingAppointment");
      // Define routes that depend on MongoDB connection
      app.use(express.json()); // Middleware to parse JSON bodies

      app.post("/addAService", (req, res) => {
        serviceCollection.insertOne(req.body).then((result) => {
          res.send(result.acknowledged);
        });
      });

      app.post("/addTestimonial", (req, res) => {
        testimonialCollection.insertOne(req.body).then((result) => {
          res.send(result.acknowledged);
        });
      });

      app.post("/addAAdmin", (req, res) => {
        adminCollection.insertOne(req.body).then((result) => {
          res.send(result.acknowledged);
        });
      });

      app.post("/addAProduct", (req, res) => {
        productCollection.insertOne(req.body).then((result) => {
          res.send(result.acknowledged);
        });
      });

      app.post("/addOrder", (req, res) => {
        orderCollection.insertOne(req.body).then((result) => {
          console.log(result);
          res.send(result.acknowledged);
        });
      });

      app.post("/addAppointment", (req, res) => {
        bookingAppointmentCollection.insertOne(req.body).then((result) => {
          res.send(result.acknowledged);
        });
      });

      app.get("/getServices", (req, res) => {
        serviceCollection.find({}).toArray((err, document) => {
          res.send(document);
        });
      });

      app.get("/appointments", (req, res) => {
        appointmentCollection.find({}).toArray((err, document) => {
          res.send(document);
        });
      });

      app.get("/checkAdmin", (req, res) => {
        adminCollection
          .find({ adminEmail: req.query.email })
          .toArray((err, document) => {
            res.send(document);
          });
      });

      app.delete("/deleteService/:id", (req, res) => {
        serviceCollection
          .deleteOne({ _id: ObjectID(req.params.id) })
          .then((result) => {
            res.send(result.acknowledged);
          });
      });

      app.get("/getOrder", (req, res) => {
        orderCollection
          .find({ email: req.query.email })
          .toArray((err, document) => {
            res.send(document);
          });
      });

      app.get("/getAppointment", (req, res) => {
        bookingAppointmentCollection
          .find({ email: req.query.email })
          .toArray((err, document) => {
            res.send(document);
          });
      });

      app.get("/orderedProduct/:id", (req, res) => {
        productCollection
          .find({ _id: ObjectID(req.params.id) })
          .toArray((err, document) => {
            if (document.length === 0) {
              appointmentCollection
                .find({ _id: ObjectID(req.params.id) })
                .toArray((err, document) => {
                  res.send(document[0]);
                });
            } else {
              res.send(document[0]);
            }
          });
      });
      app.get("/allOrders", (req, res) => {
        orderCollection.find({}).toArray((err, document) => {
          res.send(document);
        });
      });
      app.get("/bookingAppointment", (req, res) => {
        bookingAppointmentCollection.find({}).toArray((err, document) => {
          res.send(document);
        });
      });
      app.get("/getAllProducts", (req, res) => {
        productCollection.find({}).toArray((err, document) => {
          console.log("hi");
          console.log(err);
          res.send(document);
        });
      });
      app.get("/getTestimonial", (req, res) => {
        testimonialCollection.find({}).toArray((err, document) => {
          res.send(document);
        });
      });
      app.patch("/updateStatus/:id", (req, res) => {
        orderCollection
          .updateOne(
            { _id: ObjectID(req.params.id) },
            {
              $set: { status: req.body.newStatus },
            }
          )
          .then((result) => {
            if (result.modifiedCount === 0) {
              bookingAppointmentCollection.updateOne(
                { _id: ObjectID(req.params.id) },
                {
                  $set: { status: req.body.newStatus },
                }
              );
            } else {
              res.send(result.modifiedCount > 0);
            }
          });
      });
    });

    // Start Express server
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
