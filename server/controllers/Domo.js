const models = require('../models');
const Domo = models.Domo;



const makerPage = async (req, res) => {
    return res.render('app');

};

const getDomos = async (req, res) => {

    try {
        const query = { owner: req.session.account._id };
        const docs = await Domo.find(query).select('name age diet').lean().exec();

        return res.json({ domos: docs });
    } catch (err) {

        console.log(err);
        return res.status(500).json({ error: 'Error getting domos.' });
    }

};


const makeDomo = async (req, res) => {
    if (!req.body.name || !req.body.age || !req.body.diet) {

        return res.status(400).json({ error: 'Name, age, and diet are both required' });
    }

    const domoData = {
        name: req.body.name,
        age: req.body.age,
        diet: req.body.diet,
        owner: req.session.account._id,

    };

    try {
        const newDomo = new Domo(domoData);
        await newDomo.save();
        return res.status(201).json({ name: newDomo.name, age: newDomo.age });
    } catch (err) {
        console.log(err);
        if (err.code === 1100) {
            return res.status(400).json({ error: "username is already in use" });
        }

        return res.status(500).json({ error: "An error occured" });
    }
}

const updateDomo = (req, res) => {

    //find the domo9 by the name that the user wants to delete and remove it
    const updatePromise = Domo.findOneAndUpdate({name: req.body.name}, {age: req.body.age}, {
        returnDocument: 'after',
    }).lean().exec();

    updatePromise.then((doc) => res.json({
        name: doc.name,
        age: doc.age,
    }));

    //catch an error
    updatePromise.catch((err) => {

        console.log(err);
         return res.status(500).json({ error: 'Something went wrong' });

    });



};

module.exports = {
    makerPage,
    makeDomo,
    getDomos,
    updateDomo,
}