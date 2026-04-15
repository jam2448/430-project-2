
//import the necessary assets
const mongoose = require('mongoose');
const _ = require('underscore');



//here will be the recipe schema for making a recipe and adding it to the db
//A recipe will include:
/*
    Required: 
    Title = the title of the recipe
    Ingredients = A list of the ingredients needed to make the dish
    Time = Estimated amount of time to cook the recipe
    Rating = The user's rating of the meal

    Optional:
    Description/Notes = Additional Information that the User wants to add about the recipe
    Calories = The amount of Calories the dish has
    Servings = The amount of servings the dish yields 

    One of the 3 optins are Required:
    File Upload of an image/document that contains the steps to cook it
    Link to the site where they got the recipe from
    A list of steps to make the recipe


*/

const RecipeSchema = new mongoose.Schema({

    //Required things first 

    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    ingredients: {
        type: [String],
        required: true,
    },

    time: {
        type: String,
        required: true,
        trim: true,
    },
    
    rating: {
        type: Number,
        required: true,
        max: 10,
        min: 0
    },
    
    //one of the three ways to incorporate the steps 
    
    //user inputted steps
    steps: {
        type: Map,
        of: String,
    },

    //user pasted link
    link: {
        type: String,
        trim: true
    },

    //uploaded file
    fileData: {
        type: Buffer
    },
    
    fileSize: {
        type: Number,
    },

    mimetype: {
        type: String,
    },

    //Lastly, truly Optional things

    calories: {
        type: Number,
    },

    servings: {
        type: Number,
    },

    notes: {
        type: String,
        trim: true,
    },

    //and the owner of the recipe
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    }

});

RecipeModel = mongoose.model('Recipe', RecipeSchema);

module.exports = RecipeModel;