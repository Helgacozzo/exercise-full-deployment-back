import Album from "../models/albumModel.js";
import express from "express";
const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const albums = await Album.find();
        res.send(albums);
    }catch(err){
        res.status(500).send(err.message);
    }
});

router.post('/', async (req, res) => {
    try{
        const album = await Album.create(req.body);
        res.status(201).send(album);
    }catch(err){
        res.status(400).send(err.message);
    }
});

router.patch('/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const album = await Album.findByIdAndUpdate(id, req.body, {
            runValidators: true,
            new: true
        });
        res.send(album)
    }catch(err){
        res.status(404).send(err.message);
    }
});

router.delete('/:id', async (req, res) => {
    try{
        const { id } = req.params;
        await Album.findByIdAndDelete(id);
        res.send(`Album with ID ${id} was deleted successfully.`)
    }catch(err){
        res.status(404).send(err.message);
    }
});