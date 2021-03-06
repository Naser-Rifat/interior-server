const { MongoClient } = require("mongodb");
const cors = require("cors");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;
var admin = require("firebase-admin");
const { query } = require("express");
const stripe = require("stripe")(
  "sk_test_51KRz35GbmEtMgWscwSf3PYypQbDLr9wOkR9By7zG53sc8W4bgnIYJ3MXR8WyWH1OAgb1brHFNmZmcZbdZWDdQZEK00qncbUYlA"
);
const fileUpload = require("express-fileupload");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

//firebase admin intialization
const serviceAccount = require("./interior-a2fbe-firebase-adminsdk-4g9tm-45f23b69ba.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
//  MongoDB deployment's connection string.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0xoz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function verifyToken(req, res, next) {
  console.log("i am in verfiy");
  if (req.headers.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split(" ")[1];
    try {
      const decodeduser = await admin.auth().verifyIdToken(idToken);
      req.decodedUserEmail = decodeduser.email;

      console.log("decode email", decodeduser.email);
    } catch {
      console.log("in th catch");
    }
    console.log("show id token", idToken);
  }
  next();
}

async function run() {
  try {
    await client.connect();
    console.log("ok");
    const database = await client.db("project_interior");
    const imagescollection = await database.collection("images");
    const productscollection = await database.collection("products");
    const usercollection = await database.collection("user");
    const orderscollection = await database.collection("orders");
    const productimagescollection = await database.collection("productimages");
    const finalorderscollection = await database.collection("finalorders");
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
      const query = await productimagescollection.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });
    app.post("/products", async (req, res) => {
      // console.log(req.body);
      // console.log(req.files);
      const name = req.body.name;
      const model = req.body.model;

      const price = req.body.price;
      const description = req.body.description;
      const image = req.files.image;
      const pic = image.data;

      const encodedPic = pic.toString("base64");

      const imageBuffer = Buffer.from(encodedPic, "base64");
      const allformdata = {
        name,
        model,
        price,
        description,
        image: imageBuffer,
      };
      const result = await productscollection.insertOne(allformdata);
      res.send(result);
      // res.json({ success: true });
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
    // app.get("/user", async (req, res) => {
    //   const user = req.body;
    //   const findall = await usercollection.find({});
    //   const result = await findall.toArray();
    //   res.send(result);
    //   res.json(result);
    // });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await usercollection.findOne(filter);
      let IsAdmin = false;
      if (user?.role === "admin") {
        IsAdmin = true;
      }
      res.json({ admin: IsAdmin });

      // const email = req.params.email;
      // const filter = { email: email }
      // const user = await userdatacollection.findOne(filter)
      // let IsAdmin = false;
      // if (user?.role === 'admin') {
      //     IsAdmin = true;
      // }
      // res.json({ admin: IsAdmin });
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
      // console.log(req);
      // console.log(req.files.image);
      const result = await orderscollection.insertOne(order);
      res.send(result);
      res.json(result);
    });

    app.get("/orders", verifyToken, async (req, res) => {
      const email = req.query.email;
      console.log("order email", email);
      console.log("decodedUserEmail email", req.decodedUserEmail);
      if (req.decodedUserEmail === email) {
        const filter = { email: email };
        const query = await orderscollection.find(filter);
        const result = await query.toArray();
        res.send(result);
        res.json(result);
      } else {
        res.status(401).json({ message: "user not authorized" });
      }
    });
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const doc = {
        $set: {
          payment: payment,
        },
      };
      const result = await orderscollection.updateOne(filter, doc);
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
    app.put("/orders/update/:id", async (req, res) => {
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
    //-- order- end--//

    // //--final order--//
    // app.post("/final/orders", async (req, res) => {
    //   const orders = req.body;
    //   const result = await finalorderscollection.insertOne(orders);
    //   // console.log("counted", result);
    //   res.json(result);
    // });
    // app.get("/finalorders", async (req, res) => {
    //   const email = req.query.email;
    //   const filter = { email: email };
    //   const query = await finalorderscollection.find(filter);
    //   const result = await query.toArray();
    //   // console.log("counted", result);
    //   res.json(result);
    // });
    // //--end-final order//

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

    // --payment--//
    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      console.log(req.body);
      const paymentInfo = req.body;
      console.log(paymentInfo.price);
      const amount = paymentInfo.price * 100;
      console.log(amount);

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      console.log(paymentIntent.client_secret);
      res.json(paymentIntent.client_secret);
    });
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
