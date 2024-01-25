import express from "express";
import Album from "../models/Album.js";
import Musician from "../models/Musician.js";

const router = express.Router();

//POST add new album
router.post('/', async (req, res) => {

    if (!req.body) {
        return res.status(400).send('You must send a album.');
    }

    try {
        const { _id } = await Album.create(req.body);
        const album = await Album.findById(_id).select("-_id -__v");
        return res.send(album);
    } catch (error) {
        console.error(error.message);
        return res.status(400).send(error.message);
    }

});

//GET list all albums
router.get('/', async (req, res) => {

    try {
        const albums = await Album.find().select("-__v");
        return res.send(albums);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error.');
    }

});

//GET single album info
router.get('/:slug', async (req, res) => {

    const { slug } = req.params;

    try {
        const album = await Album.findBySlug(slug).select("-slug \-__v");
        if (!album) {
            throw new Error(`Album of slug '${slug}' not found.`);
        }
        return res.send(album);
    } catch (error) {
        console.error(error.message);
        return res.status(404).send(error.message);
    }

});

//PATCH single album update
router.patch('/:slug', async (req, res) => {

    if (!req.body || !Object.keys(req.body).length) {
        return res.status(400).send('You must pass a body with at least one property.');
    }

    const { slug } = req.params;
    const newProperties = Object.entries(req.body);

    try {
        const album = await Album.findBySlug(slug);
        if (!album) {
            return res.status(404).send(`Album of slug '${slug}' not found.`);
        }
        newProperties.forEach(([key, value]) => {
            album[key] = value;
        });
        await album.save();
        return res.send(album);
    } catch (error) {
        console.error(error.message);
        return res.status(404).send(error.message);
    }

});

//DELETE single album delete
router.delete('/:slug', async (req, res) => {

    const { slug } = req.params;

    try {
        const album = await Album.findBySlug(slug);
        //rimuovo l'album che sto eliminando dal musicista che vi era associato
        await album.removeFromMusician();
        await Album.deleteOne({ slug });

        return res.send(`Album with slug ${slug} was successfully deleted.`);
    } catch (error) {
        console.error(error.message);
        return res.status(404).send(error.message);
    }

});



export default router;