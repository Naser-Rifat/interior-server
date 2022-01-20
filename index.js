const { MongoClient } = require('mongodb');
const cors =require('cors');
const express = require("express");
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();

const app =express();

const port = process.env.PORT || 8000;

app.use(cors())
app.use(express.json())
// Replace the following with your MongoDB deployment's connection string.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0xoz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {

        
      await client.connect();
      console.log("ok");
      const database = await client.db('project_interior');
      const imagescollection = await database.collection('images');
      const productscollection = await database.collection('products');
      const usercollection = await database.collection('user');
      const latest_interiorscollection = await database.collection('latest_interiors');
      console.log("ok2");


      app.get('/images',async( req, res)=>{
            const query = await imagescollection.find({})
            const result =await query.toArray();
         
            res.send(result)
            res.json(result)
      })
      app.get('/productsimages',async( req, res)=>{
            const query = await productscollection.find({})
            const result =await query.toArray();
            res.send(result)
            res.json(result)
      })


      app.post("/user", async (req, res) => {
        const user = req.body;
        const result = await usercollection.insertOne(user)
        res.json(result);

    })
      app.put('/user' ,async(req,res)=>{
        const user =req.body;
         const filter ={email:user?.email}
         const option ={upsert:true}
         const document ={$set:user}
        const result =usercollection.insertOne(filter,document,option);
        res.send(result)
        res.json(result);
        
        
      })
      app.get('/users' ,async(req,res)=>{

        const user =req.body;
        const filter ={email:user?.email}

        
      })
      app.get('/latest_interiors' ,async(req,res)=>{

        const query = await latest_interiorscollection.find({})
        const result =await query.toArray();
        res.send(result)
        res.json(result)

        
      })
      app.get('/latest_interiors/:id' ,async(req,res)=>{
         const id =req.params.id;
         const filter = { _id: ObjectId(id) }
        const result = await latest_interiorscollection.findOne(filter)
   
        res.send(result)
        res.json(result)

        
      })

      // Query for a movie that has the title 'Back to the Future'
    //   const query = { title: 'Back to the Future' };
    //   const movie = await movies.findOne(query);
    //   console.log(movie);
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }

  run().catch(console.dir);

  
  app.get('/', async(req,res)=>{
    res.send("server running 2");
})
app.listen(port ,()=>{
    console.log(port);
})



