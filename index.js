import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";

const app = express();

const port = 3000;

const mongodb = "mongodb://127.0.0.1:27017/backend-gp";

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/users')

app.get('/', (req, res) => {
    res.send("Backend GP Footwear funcionando.");
});

mongoose.connect(mongodb)
    .then(() => console.log("MongoDB connected to GP Footwear."))
    .catch(error => console.error("Connection error: ", error));


app.listen(port, () => {
    console.log(`Server is running in port ${port}.`);
});