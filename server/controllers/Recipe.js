
const { after } = require('underscore');
const models = require('../models');
const Recipe = models.Recipe;



const makerPage = async (req, res) => {
    return res.render('app');

};

const profitModels = async (req, res) => {
    return res.render('profitModels');
}

const getRecipes = async (req, res) => {

    try {
        const query = { owner: req.session.account._id };
        const docs = await Recipe.find(query).select('title rating time calories').lean().exec();

        return res.json({ recipes: docs });
    } catch (err) {

        console.log(err);
        return res.status(500).json({ error: 'Error getting Recipes.' });
    }

    console.log(recipes);

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

    //get the samplefile only if it was uploaded. else return null
    const sampleFile = req.files?.sampleFile || null;

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
        //notes: req.body.notes,

        //handling the file only if the user has uploaded one
        fileData: sampleFile?.data || null,
        fileSize: sampleFile?.size || null,
        mimetype: sampleFile?.mimetype || null,

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

    //get the samplefile only if it was uploaded. else return null
    const sampleFile = req.files?.sampleFile || null;

    //find the Recipe by the id that the user wants to update and update the data
    const updatePromise = Recipe.findByIdAndUpdate(req.body._id,
        {
            title: req.body.title,
            time: req.body.time,
            rating: req.body.rating,
            calories: req.body.calories,
            fileData: sampleFile?.data || null,
            fileSize: sampleFile?.size || null,
            mimetype: sampleFile?.mimetype || null,
            steps: req.body.steps,
            link: req.body.link,


        }, {
        returnDocument: 'after',
    }).lean().exec();

    updatePromise.then((doc) => res.json({
        title: doc.title,
        time: doc.time,
        rating: doc.rating,
        calories: doc.calories,
        steps: doc.steps,
        link: doc.link,
    }));

    //catch an error
    updatePromise.catch((err) => {

        console.log(err);
        return res.status(500).json({ error: 'Something went wrong' });

    });



};

const deleteRecipe = (req, res) => {


    console.log(req.body.title);


    const deletePromise = Recipe.findOneAndDelete({ title: req.body.title }, {
        returnDocument: 'after',
    }).exec();
    deletePromise.then(() => {
        return res.status(200).json({ message: 'Recipe added Successfully' })
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong' });
    });
}



module.exports = {
    makerPage,
    makeRecipe,
    getRecipes,
    updateRecipe,
    profitModels,
    deleteRecipe,
}