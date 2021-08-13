const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const fs = require('fs');


mongoose.connect('mongodb+srv://CodeX:codex123@natures.uyq6l.mongodb.net/natours?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}).then( con => {
    console.log("database succesfully connected")
}).catch(err => {
    console.log("not connected", err)
})


const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));


async function importData(){
    await Tour.deleteMany();
    await Tour.create(tours);
    console.log("successfully data created");
}


importData();