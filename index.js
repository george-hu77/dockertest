const express = require("express");
const mongoose = require('mongoose');
const {MONGO_USER,MONGO_PASSWORD,MONGO_IP,MONGO_PORT,SESSION_SECRET,REDIS_URL, REDIS_PORT} = require("./config/config");
const session = require("express-session")
const redis = require("redis")
const cors = require("cors")
let RedisStore= require("connect-redis")(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
})
const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")
const app = express();

const mongoURL = 'mongodb://george:password@mongo:27017/?authSource=admin'

const connectWithRetry =()=>{
    mongoose
    .connect(mongoURL,{
        useNewUrlParser: true,
        useUnifiedTopology:true,
       // useFindAndModify: false
    })
    //.connect('mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin')???
    .then(() => console.log("successfully connected to DB"))
    .catch((e) =>{ 
        console.log(e)
        setTimeout(connectWithRetry, 5000)
    });
}

connectWithRetry();
app.enable("trust proxy");
app.use(cors({}));
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie:{
        secore: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000,
    },
}));

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2> Hi George!!</h2>");
    console.log("yeah it ran");
});
//locathost:3000/api/v1/posts
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 3000;

app.listen(port,() => console.log('listening on port ${port}'));