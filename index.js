import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const { EXPRESS_PORT, MONGODB_URI } = process.env;
import mongoose from "mongoose";
import musicians from "./routes/musicians.js"
import albums from "./routes/albums.js";

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/albums', albums);
app.use('/musicians', musicians);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Connesssione a Mongo DB effettuata con successo.");
        app.listen(EXPRESS_PORT, () => {
            console.log(`Server ON e in ascolto su porta ${EXPRESS_PORT}.`)
        })
    })
    .catch(err => console.error(`Errore connessione a MongoDB`, err));

export default app;

