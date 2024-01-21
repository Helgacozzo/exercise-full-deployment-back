import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const schema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    art_name: {
        type: String,
        required: true
    },
    birth_date: {
        type: Date,
        required: true
    },
    albums: [{
        type: SchemaTypes.ObjectId,
        ref: 'Album'
    }],
});

schema.methods.removeAlbum = async function (albumId) {
    const albums = this.albums.map(a => a.toString());
    if (albums.includes(albumId)) {
        albums.splice(albums.indexOf(albumId), 1);
        this.albums = albums;
        await this.save();
    }
}

schema.methods.addAlbum = async function (albumId) {
    this.albums.push(albumId);
    await this.save();
}

const Musician = model("Musician", schema);

export default Musician;