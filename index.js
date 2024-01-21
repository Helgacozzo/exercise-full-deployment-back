import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const { MONGODB_URI } =process.env;
import mongoose from "mongoose";
import Album from "./models/albumModel.js";
import Musician from "./models/musicianModel.js";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan('dev'));
app.use(cors({origin: '*'}));
app(express.json());

app.use('/albums', albumsRouter);
app.use('/musicians', musiciansRouter);

mongoose.connect(MONGODB_URI)
.then( () => {
    console.log("Connesssione a Mongo DB effettuata con successo.");
    app.listen(PORT, () => {
        console.log(`Server ON e in ascolto su porta ${PORT}.`)
    })
})
.catch(err => console.error(err));

export default app;

