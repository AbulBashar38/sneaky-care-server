const express = require("express");
const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const { ServerApiVersion, ObjectId } = require("mongodb");
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
    client
      .connect()
      .then(() => {
        console.log("Connected to MongoDB");

        const database = client.db(`${process.env.DB_NAME}`);
        const productCollection = database.collection("allProduct");
        const serviceCollection = database.collection("services");
        const orderCollection = database.collection("orders");
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

        app.get("/getServices", async (req, res) => {
          try {
            const documents = await serviceCollection.find().toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });

        app.get("/appointments", async (req, res) => {
          try {
            const documents = await appointmentCollection.find().toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });

        app.get("/checkAdmin", async (req, res) => {
          try {
            const documents = await adminCollection
              .find({ adminEmail: req.query.email })
              .toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });

        app.delete("/deleteService/:id", (req, res) => {
          const queryId = new ObjectId(req.params.id);
          serviceCollection.deleteOne({ _id: queryId }).then((result) => {
            res.send(result.acknowledged);
          });
        });

        app.get("/getOrder", async (req, res) => {
          try {
            const documents = await orderCollection
              .find({ adminEmail: req.params.email })
              .toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });

        app.get("/getAppointment", async (req, res) => {
          try {
            const documents = await bookingAppointmentCollection
              .find({ adminEmail: req.params.email })
              .toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });

        app.get("/orderedProduct/:id", async (req, res) => {
          try {
            const queryId = new ObjectId(req.params.id);
            const documents = await productCollection
              .find({ _id: queryId })
              .toArray();

            console.log(documents);

            if (documents.length === 0) {
              try {
                const appointmentDocuments = await appointmentCollection
                  .find({ _id: queryId })
                  .toArray();
                res.status(200).send(appointmentDocuments[0]);
              } catch (error) {
                res.status(500).send("Internal Server Error");
              }
            } else {
              res.status(200).send(documents[0]);
            }
          } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
          }
        });

        app.get("/allOrders", async (req, res) => {
          try {
            const documents = await orderCollection.find({}).toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });
        app.get("/bookingAppointment", async (req, res) => {
          try {
            const documents = await bookingAppointmentCollection
              .find({})
              .toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });
        app.get("/getAllProducts", async (req, res) => {
          try {
            const documents = await productCollection.find({}).toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });
        app.get("/getTestimonial", async (req, res) => {
          try {
            const documents = await testimonialCollection.find({}).toArray();
            res.status(200).send(documents);
          } catch (error) {
            res.status(500).send("Internal Server Error");
          }
        });
        app.patch("/updateStatus/:id", (req, res) => {
          const queryId = new ObjectId(req.params.id);
          orderCollection
            .updateOne(
              { _id: queryId },
              {
                $set: { status: req.body.newStatus },
              }
            )
            .then((result) => {
              if (result.modifiedCount === 0) {
                bookingAppointmentCollection.updateOne(
                  { _id: queryId },
                  {
                    $set: { status: req.body.newStatus },
                  }
                );
              } else {
                res.send(result.modifiedCount > 0);
              }
            });
        });
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
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
