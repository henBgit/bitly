const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const url = "mongodb+srv://hen:yaron123@cluster0.akhuvdw.mongodb.net/bitly_db";


mongoose.connect(url).then(()=>{
    console.log("Database is ON!");
}).catch((err)=>{
    console.log(err);
})

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(bodyParser.json());




const BitlySchema = mongoose.Schema({
    LongLink:String,
    ShortLink:String

});

const BitlyModel = mongoose.model("bitly_collection",BitlySchema);

app.post("/add", async (req, res) => {
    try {
        const { longLink } = req.body;
        const existingBitly = await BitlyModel.findOne({ LongLink: longLink });
        if (existingBitly) {
            res.status(200).json({ message: existingBitly.ShortLink });
            return;
        }
        const ShortLink =  CreateShortLink(longLink);
        const newBitly = new BitlyModel({
            LongLink: longLink,
            ShortLink: ShortLink
        });
        await newBitly.save();
        res.status(200).json({ message:  ShortLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while saving the link' });
    }
});

app.get('/all', async (req, res) => {
    try {
        const allBitlys = await BitlyModel.find();
        if (allBitlys.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }
        res.status(200).json(allBitlys);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving records' });
    }
});
app.get("/:shortLink", async (req, res) => {
    try {
        const { shortLink } = req.params;
        const bitly = await BitlyModel.findOne({ ShortLink: shortLink });
        if (bitly) {
            res.redirect(bitly.LongLink);
        } else {
            res.status(404).json({ error: 'Short link not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while redirecting' });
    }
});













function CreateShortLink() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const shortLinkLength = 6; 
    let shortLink = '';

    for (let i = 0; i < shortLinkLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortLink += characters[randomIndex];
    }

    return shortLink;
}










app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/public/index.html");

});





//port
app.listen(3377,()=>{
    console.log("server works on port 3377");
})