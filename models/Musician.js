import mongoose from "mongoose";
import dayjs from "dayjs";
import Album from "./Album.js";
const { Schema, SchemaTypes, model } = mongoose;

const schema = new Schema({
    first_name: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
        trim: true,
    },
    art_name: {
        type: String,
        minLength: 1,
        maxLength: 50,
        trim: true,
        default: null,
        validate: {
            validator: async function (art_name) {
                if (!art_name) {
                    return true;
                }
                const Musician = this.constructor;
                const isValid = !(await Musician.exists({ art_name }));
                return isValid
            },
            message: (props) => `${props.value} is already used as art_name.`
        },
    },
    birth_date: {
        type: Date,
        required: true,
        max: () => {
            const now = dayjs();
            const sixYearsAgo = now.subtract(6, "years");
            return sixYearsAgo.format("YYYY-MM-DD");
        },
    },
    birth_place: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
        trim: true,
    },
    albums: {
        type: [SchemaTypes.ObjectId],
        ref: 'Album'
    },
    slug: {
        type: String,
        trim: true,
        validate: {
            validator: async function (slug) {
                const Musician = this.constructor;
                const isValid = this.slug === slug || !(await Musician.exists({ slug }));
                return isValid
            },
            message: (props) => `${props.value} is already used as slug.`
        },
        index: true
    }
}, { timestamps: true });

//metodo per creare uno slug
schema.methods.createSlug = async function () {
    const Musician = this.constructor;
    const { art_name, first_name, last_name } = this;
    let slug_name = art_name || `${first_name}-${last_name}`;
    if (slug_name !== art_name) {
        const musicians = await Musician.find({ first_name, last_name }).sort({ createdAt: -1 });
        const ids = musicians.map(a => a._id.toString());
        const index = ids.indexOf(this._id.toString());
        if (index > 0) {
            slug_name += '-' + index;
        }
    }
    this.slug = slug_name.replaceAll(" ", "-").toLowerCase();
}

schema.methods.removeAlbum = async function (albumId) {
    const Musician = this.constructor;
    const albumsIds = this.albums.map(a => a._id.toString());
    if (albumsIds.includes(albumId)) {
        albumsIds.splice(albumsIds.indexOf(albumId), 1);
        await Musician.findByIdAndUpdate(this._id, { albums: albumsIds });
        console.log(`A album was removed from Musician ${this.first_name} ${this.last_name}`);
    }
}

schema.methods.addAlbum = async function (albumId) {
    const albumsIds = this.comics.map(c => c._id.toString());
    if (!albumsIds.includes(albumId)) {
        albumsIds.push(albumId)
        await Musician.findByIdAndUpdate(this._id, { albums: albumsIds });
        console.log(`New album added to Musician ${this.first_name} ${this.last_name}`);
    }
}

schema.methods.removeFromAlbums = async function (albumId) {
    const albumsIds = this.albumss.map(c => c._id.toString());
    albumsIds.forEach(async albumId => {
        const album = await Album.findById(albumId);
        await album.changeMusician(null);
    })
}

schema.pre('save', async function (next) {

    const Musician = this.constructor;

    await this.createSlug();

    if (this.isModified("albums")) {
        const oldMusicianId = this._id.toString();
        const oldMusician = await Musician.findById(oldMusicianId);
        if (oldMusician) {
            this.oldAlbums = oldMusician.comics.map(c => c._id.toString());
            await this.syncAlbums()
        }
    }

    next();

});

schema.post('save', async function (doc, next) {

    const { oldAlbums, _id } = doc;
    if (oldAlbums) {
        const newAlbums = doc.albums.map(c => c._id.toString());
        oldAlbums.forEach(async oldAlbumId => {
            if (!newAlbums.includes(oldAlbumId)) {
                //oldAlbumId è stato rimosso, quindi lo comunico all'album
                const album = await Album.findById(oldAlbumId)
                if (album) {
                    await comic.changeMusician(null);
                    await Album.findByIdAndUpdate(oldAlbumId, { author: null });
                    console.log(`Musician removed from Album ${album.title}`);
                }
            }
        });
        newAlbums.forEach(async newAlbumId => {
            if (!oldAlbums.includes(newAlbumId)) {
                //newAlbumId è stato aggiunto, quindi lo comunico all'album
                const album = await Album.findById(newAlbumId);
                if (album) {
                    await album.changeMusician(_id);
                    console.log(`Musician changed on Album ${album.title}`);
                }
            }
        })
    }

    next();

});

const Musician = model("Musician", schema);

export default Musician;