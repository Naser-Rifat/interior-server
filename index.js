const { MongoClient } = require("mongodb");
const cors = require("cors");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const { query } = require("express");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());
// Replace the following with your MongoDB deployment's connection string.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0xoz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("ok");
    const database = await client.db("project_interior");
    const imagescollection = await database.collection("images");
    const productscollection = await database.collection("products");
    const usercollection = await database.collection("user");
    const orderscollection = await database.collection("orders");
    const latest_interiorscollection = await database.collection(
      "latest_interiors"
    );
    const feedbackcollection = await database.collection("customerfeedback");

    console.log("ok2");

    app.get("/images", async (req, res) => {
      const query = await imagescollection.find({});
      const result = await query.toArray();

      res.send(result);
      res.json(result);
    });

    // products //
    app.get("/productsimages", async (req, res) => {
      const query = await productscollection.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });

    app.get("/products", async (req, res) => {
      const query = await productscollection.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productscollection.findOne(filter);
      res.json(result);
    });
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productscollection.deleteOne(filter);
      res.json(result);
    });

    // products --end//

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await usercollection.insertOne(user);
      res.json(result);
    });
    app.put("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user?.email };
      const option = { upsert: true };
      const document = { $set: user };
      const result = usercollection.insertOne(filter, document, option);
      res.send(result);
      res.json(result);
    });
    app.get("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user?.email };
    });

    //-- latest -interior -- //
    app.get("/latest_interiors", async (req, res) => {
      const query = await latest_interiorscollection.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });

    app.get("/latest_interiors/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await latest_interiorscollection.findOne(filter);

      res.send(result);
      res.json(result);
    });
    //-- latest -interior -end //

    //-- order --//

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderscollection.insertOne(order);
      res.send(result);
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const query = await orderscollection.find(filter);
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });
    app.get("/orders/all", async (req, res) => {
      const query = await orderscollection.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("request id ", id);
      const filter = { _id: ObjectId(id) };
      const result = await orderscollection.deleteOne(filter);
      res.send(result);
      console.log(result);
      res.json(result);
    });
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const doc = {
        $set: {
          status: 200,
        },
      };
      const result = await orderscollection.updateOne(filter, doc, options);
      console.log("counted", result);
      res.json(result);
    });
    // order- end--//

    //-- Feedback--//
    app.post("/feedback", async (req, res) => {
      const feedback = req.body;
      const result = await feedbackcollection.insertOne(feedback);
      res.send(result);
      res.json(result);
    });
    app.get("/feedback", async (req, res) => {
      const query = await feedbackcollection.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });
    app.post("/feedback", async (req, res) => {
      const feedback = req.body;
      const result = await feedbackcollection.insertOne(feedback);
      res.json(result);
    });
    //-- Feedback--//
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("server running 2");
});
app.listen(port, () => {
  console.log(port);
});
