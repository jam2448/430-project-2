const { sample } = require('underscore');
const models = require('../models');
const Recipe = models.Recipe;



const makerPage = async (req, res) => {
    return res.render('app');

};

const getRecipes = async (req, res) => {

    try {
        const query = { owner: req.session.account._id };
        const docs = await Recipe.find(query).select('title rating time').lean().exec();

        return res.json({ Recipes: docs });
    } catch (err) {

        console.log(err);
        return res.status(500).json({ error: 'Error getting Recipes.' });
    }

};

//Used to make a recipe and save the info to the database 
const makeRecipe = async (req, res) => {


    //if the user has not added the required data, throw an error
    if (!req.body.title || !req.body.ingredients || !req.body.time || !req.body.rating) {

        return res.status(400).json({ error: 'Title, ingredients, time, and rating are all required' });
    }

    //if the user has not entered one of the three options, throw an error:
    if (!req.body.steps && !req.body.link && !req.files && !req.sampleFile) {

        return res.status(400).json({ error: 'You must add steps to your recipe!' });
    }

    const { sampleFile } = req.files;


    //make a js object containing all of the recipe data
    const RecipeData = {

        //add the required things
        title: req.body.title,
        ingredients: req.body.ingredients,
        time: req.body.time,
        rating: req.body.rating,
    
        //optional things
        calories: req.body.calories,
        servings: req.body.servings,
        notes: req.body.notes,

        //handling the file
        fileData: sampleFile.data,
        fileSize: sampleFile.size,
        mimetype: sampleFile.mimetype,

        //steps and link
        steps: req.body.steps,
        link: req.body.link,

        owner: req.session.account._id,
    };

    try {
        const newRecipe = new Recipe(RecipeData);
        await newRecipe.save();
        return res.status(201).json({ title: newRecipe.title, rating: newRecipe.rating });
    } catch (err) {
        console.log(err);
        if (err.code === 1100) {
            return res.status(400).json({ error: "username is already in use" });
        }

        return res.status(500).json({ error: "An error occured" });
    }
}

const updateRecipe = (req, res) => {

    //find the Recipe by the name that the user wants to delete and remove it
    const updatePromise = Recipe.findOneAndUpdate({ title: req.body.title }, { age: req.body.age }, {
        returnDocument: 'after',
    }).lean().exec();

    updatePromise.then((doc) => res.json({
        title: doc.title,
        //age: doc.age,
    }));

    //catch an error
    updatePromise.catch((err) => {

        console.log(err);
        return res.status(500).json({ error: 'Something went wrong' });

    });



};

module.exports = {
    makerPage,
    makeRecipe,
    getRecipes,
    updateRecipe,
}