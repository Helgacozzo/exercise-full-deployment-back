import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const schema = new Schema({
    title: {
        type: String,
        required: true
    },
    duration_seconds: {
        type: Number,
        required: true
    },
    musician: {
        type: SchemaTypes.ObjectId,
        ref: "Musician",
        default: null
    }
});

schema.pre('save', async function (next) {
    //oldMusician
    if (this.isModified('musician')) {
        const Album = this.constructor;
        const albumId = this._id.toString();
        const oldAlbum = await Album.findById(albumId);
        const oldMusicianId = oldAlbum.musician?.toString();
        if (oldMusicianId) {
            const oldMusician = await Musician.findById(oldMusicianId);
            if (oldMusician) {
                await oldMusician.removeAlbum(albumId);
                console.log('PRE save', 'Album rimosso dal vecchio musicista.');
            }
        }
    }
    next()
});

schema.post('save', async function (doc, next) {
    //newMusician
    const newAlbum = doc;
    const albumId = this._id.toString();
    const newMusicianId = newAlbum.musician?.toString();
    if (newMusicianId) {
        const newMusician = await Musician.findById(newMusicianId);
        if (newMusician) {
            await newMusician.addAlbum(albumId);
            console.log('POST save ', 'Album aggiunto al nuovo musicista.');
        }
    }
    next()
});

schema.pre('remove', async function (next) {
    //oldMusician
    const oldAlbum = this;
    const albumId = oldAlbum._id.toString();
    const oldMusicianId = oldAlbum.musician?.toString();
    if (oldMusicianId) {
        const oldMusician = await Musician.findById(oldMusicianId);
        if (oldMusician) {
            await oldMusician.removeAlbumAlbum(albumId);
            console.log('PRE remove', 'Album rimosso dal vecchio musicista.');
        }
    }
    next()
});

const Album = model("Album", schema);

export default Album;