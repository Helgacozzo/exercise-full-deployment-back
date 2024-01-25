import mongoose from "mongoose";
import Musician from "./Musician.js"
const { Schema, SchemaTypes, model } = mongoose;

const schema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
        trim: true,
    },
    author: {
        type: SchemaTypes.ObjectId,
        ref: "Musician",
        required: true,
    },
    slug: {
        type: String,
        trim: true,
        validate: {
            validator: async function (slug) {
                const Album = this.constructor;
                const isValid = this.slug === slug || !(await Album.exists({ slug }));
                return isValid
            },
            message: (props) => `${props.value} is already used as slug.`
        },
        index: true
    }
}, { timestamps: true });

//static per trovare album dallo slug
schema.statics.findBySlug = function (slug) {
    return this.findOne({ slug })
}

//metodo per creare uno slug
schema.methods.createSlug = async function () {
    const slug = this.title.replaceAll(" ", "-").toLowerCase();
    const Album = this.constructor;
    let isSlugValid = false;
    let currentSlug = slug;
    let i = 1;
    while (!isSlugValid) {
        isSlugValid = !(await Album.exists({ slug: currentSlug }));
        if (!isSlugValid) {
            currentSlug = slug + "-" + i;
            i++;
        }
    }
    this.slug = currentSlug;
}

schema.methods.removeFromMusician = async function () {
    if (this.musician) {
        const oldMusician = await Musician.findById(this.author);
        if (oldMusician) {
            await oldMusician.removeAlbum(this._id.toString());
        }
    }
}

schema.methods.changeMusician = async function (musicianId) {
    const Album = this.constructor;
    await Album.findByIdAndUpdate(this._id, { musicianId });
}

schema.pre('save', async function (next) {

    const Album = this.constructor;

    if (!this.slug) {
        await this.createSlug();
    }

    if (this.isModified("musician")) {
        this.musicianIsModified = true;
        const oldAlbumId = this._id.toString();
        const oldAlbum = await Album.findById(oldAlbumId);
        if (oldAlbum) {
            //rimuovo l'album che sto modificando dal musicista che vi era associato
            await oldAlbum.removeFromMusician();
        }
    }

    next();

});

schema.post('save', async function (doc, next) {

    if (doc.musicianIsModified) {
        const newMusicianId = doc.musician?.toString();
        if (newMusicianId) {
            const newMusician = await Musician.findById(newMusicianId);
            if (newMusician) {
                await newMusician.addAlbum(doc._id);
            }
        }
        delete doc.musicianIsModified;
    }

    next();
});

const Album = model("Album", schema);

export default Album;