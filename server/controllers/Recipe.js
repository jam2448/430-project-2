
const models = require('../models');
const Recipe = models.Recipe;

const makerPage = async (req, res) => {
    return res.render('app');
};

const profitModels = async (req, res) => {
    return res.render('profitModels');
}

const recipePage = async (req, res) => {
    return res.render('recipe');
}

const notFound = async (req, res) => {
    return res.render('notFound');
};

//get all of the recipes
const getRecipes = async (req, res) => {

    try {
        const query = { owner: req.session.account._id };
        const docs = await Recipe.find(query).select('title rating time calories ingredients steps link fileData servings').lean().exec();

        return res.json({ recipes: docs });
    } catch (err) {

        console.log(err);
        return res.status(500).json({ error: 'Error getting Recipes.' });
    }

};

//Used to make a recipe and save the info to the database 
const makeRecipe = async (req, res) => {

    //count the amounbt of recipes the user has in the db by using 
    //countDocuments mongoose function
    const recipeCount = await Recipe.countDocuments({ owner: req.session.account._id })

    //if this user is on the free plan and they try to make a recipe after making 3
    //tell them that they need to upgrade to premium to get unlimited

    if (recipeCount >= 3 && req.session.account.accountType === 'Free') {

        return res.status(400).json({ error: 'Upgrade to Premium to get unlimited Recipes' });
    }

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
        fileName: sampleFile?.name ||null,

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

//update a recipe
const updateRecipe = async (req, res) => {

    //only get the samplefile if it was uploaded
    const sampleFile = req.files?.sampleFile || null;

    //only include fields that were actually submitted
    const updates = {};

    //check and see if any of the fields have input
    if (req.body.title) updates.title = req.body.title;
    if (req.body.time) updates.time = req.body.time;
    if (req.body.rating) updates.rating = req.body.rating;
    if (req.body.calories) updates.calories = req.body.calories;
    if (req.body.steps) updates.steps = req.body.steps;
    if (req.body.link) updates.link = req.body.link;

    // only update file fields if a new file was uploaded
    if (sampleFile) {
        updates.fileData = sampleFile.data;
        updates.fileSize = sampleFile.size;
        updates.mimetype = sampleFile.mimetype;
        updates.fileName = sampleFile.name;
    }

    try {
        const doc = await Recipe.findByIdAndUpdate(
            req.body._id,
            { $set: updates },  // only updates the fields in the updates object
            { returnDocument: 'after' }
        ).lean().exec();

        return res.json({ 
            title: doc.title,
            time: doc.time,
            rating: doc.rating,
            calories: doc.calories,
            steps: doc.steps,
            link: doc.link,
        });

    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

//delete a recipe
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

//if the user uploaded a file, this function retrieves it so taht it can be downloaded on the 
//recipe page
const getFile = async (req, res) => {

    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe || !recipe.fileData) {
            return res.status(404).json({ error: 'No file found' });
        }

        res.set('Content-Type', recipe.mimetype);
        res.set('Content-Disposition', `attachment; filename="${recipe.fileName}"`);
        res.send(recipe.fileData);


    } catch (err) {

        console.log(err);
        return res.status(500).json({ error: 'Error downloading file' });
    }



}

//gets informaation about a single recipe by finding the recipe by id
const getRecipe = async (req, res) => {

    try {

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

        return res.status(200).json({ recipe });

    } catch (err) {

        console.log(err);

        return res.status(500).json({ error: 'Error getting recipe' });
    }
};




module.exports = {
    makerPage,
    makeRecipe,
    getRecipes,
    updateRecipe,
    profitModels,
    deleteRecipe,
    recipePage,
    getFile,
    getRecipe,
    notFound
}