import express from "express";
import Musician from "../models/Musician.js";
const router = express.Router();

//POST add new musicans
router.post('/', async (req, res) => {

    if (!req.body) {
        return res.status(400).send('You must send a musician.');
    }

    try {
        const { _id } = await Musician.create(req.body);
        const musician = await Musician.findById(_id).select("-__v");
        return res.send(musician);
    } catch (error) {
        console.error(error.message);
        return res.status(400).send(error.message);
    }

});

//GET list all musicians
router.get('/', async (req, res) => {

    try {
        const musicians = await Musician.find().select("-__v");
        return res.send(musicians);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error.');
    }

});

//GET single musician info
router.get('/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const musician = await Musician.findById(id).select("-_id -__v");
        if (!musician) {
            throw new Error(`Musician of id '${id}' not found.`);
        }
        return res.send(musician);
    } catch (error) {
        console.error(error.message);
        return res.status(404).send(error.message);
    }

});

//PATCH single musician update
router.patch('/:id', async (req, res) => {

    if (!req.body || !Object.keys(req.body).length) {
        return res.status(400).send('You must pass a body with at least one property.');
    }

    const { id } = req.params;
    const newProperties = Object.entries(req.body);

    try {
        const musician = await Musician.findById(id);
        if (!musician) {
            return res.status(404).send(`Musician of id '${id}' not found.`);
        }
        newProperties.forEach(([key, value]) => {
            musician[key] = value;
        });
        await musician.save();
        return res.send(Musician);
    } catch (error) {
        console.error(error.stack);
        return res.status(404).send(error.message);
    }

});

//DELETE all musicians delete
router.delete('/', async (req, res) => {

    try {
        await Musician.deleteMany({});
        return res.send('All musicians were successfully deleted.');
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error.');
    }

});

//DELETE single musician delete
router.delete('/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const musician = await Musician.findById(id);
        await musician.removeFromAlbums();

        await Musician.findByIdAndDelete(id);
        return res.send(`Musician with id ${id} was successfully deleted.`);
    } catch (error) {
        console.error(error.message);
        return res.status(404).send(error.message);
    }

});

export default router;