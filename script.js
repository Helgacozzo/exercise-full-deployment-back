import dotenv from "dotenv";
dotenv.config();
const { MONGODB_URI } = process.env;
import mongoose from "mongoose";
// import Album from "./models/albumModel.js";
// import Musician from "./models/musicianModel.js"

const run = async () => {

    try {

        await mongoose.connect(MONGODB_URI);

        // const doc = new Album({
        //     title: 'Album Uno',
        //     duration_seconds: 320
        // })

        // const doc = new Musician({
        //     first_name: 'Gigi',
        //     last_name: 'Gigetto',
        //     art_Name: 'Gigione',
        //     birth_date: '11/02/1987'
        // })

        // await doc.save();
        // console.log(doc);
        
    } catch (error) {

        console.log(error.message)

    }

}

run();