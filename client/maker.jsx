import Popup from 'reactjs-popup';
import { forEach } from 'underscore';

const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


const handleRecipe = (e, onRecipeAdded, ingredients, manualSteps) => {
    e.preventDefault();
    helper.hideError();

    //get the value from all of the fields that the user puts data into
    //start with the required fields
    const title = e.target.querySelector("#title").value;
    const time = e.target.querySelector('#time').value;
    const rating = e.target.querySelector('#rating').value;

    //get the method of the steps here and see what they selected 
    const stepsMethod = e.target.querySelector('#stepsMethod').value;

    //optinal fields
    const calories = e.target.querySelector('#calories').value;
    const servings = e.target.querySelector('#servings').value;

    //if the user does not enter these fields, send an error
    if (!title || !time || !rating || !ingredients) {
        helper.handleError("Title, Time, Rating, and Ingredients are Required");
        return false;
    }


    //put all of the data in a formData object in case the user uploads an image,
    //it will be handled properly
    const formedRecipe = new FormData();
    formedRecipe.append('title', title);
    formedRecipe.append('time', time);
    formedRecipe.append('rating', rating);
    formedRecipe.append('calories', calories);
    formedRecipe.append('servings', servings);

    //add the ingredients array by looking through the array of ingredients and adding them to the formData
    ingredients.forEach((ingredient) => {
        formedRecipe.append('ingredients', ingredient.ingredientName);
    });

    //depending on the steps method add the correct info to the formData:
    //manual steps: get each step from the array and add it to the fromData steps array
    if (stepsMethod === 'manually') {
        manualSteps.forEach((step) => {
            formedRecipe.append('steps', step.typedStep);
        });

    }
    else if (stepsMethod === 'link') {
        //if its a link, then just get the link and add it
        const link = e.target.querySelector('#link').value;
        formedRecipe.append('link', link);
    }
    else if (stepsMethod === 'fileUpload') {

        //if the user wants to upload the file, get the file and add it
        const uploadedFile = e.target.querySelector('#uploadedFile').files[0];

        formedRecipe.append('sampleFile', uploadedFile);

    }

    console.log(formedRecipe);

    helper.sendPost(e.target.action, formedRecipe, onRecipeAdded);
    return false;
}

const handleUpdate = (e, onRecipeUpdated) => {

    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector("#name").value;
    const age = e.target.querySelector('#age').value;

    if (!name || !age) {
        helper.handleError("All Update fields are required");
        return false;
    }

    helper.sendPost(e.target.action, { name, age }, onRecipeUpdated);
    return false;

}





const RecipeForm = (props) => {

    //handles when the user modifies one of the ingredients so that it gets handles properly 
    const handleIngredientChange = (e, index) => {

        //get the name of the ingredient to be modified
        const ingName = e.target.name;

        //create a copy of the ing. array to not directly modify the original
        const newIngredients = [...ingredients];

        newIngredients[index][ingName] = e.target.value;
        setIngredients(newIngredients);

    };

    //handle when a step is changed
    const stepChange = (e, index) => {

        //get the name of the step to be modified
        const stepName = e.target.name;

        //create a copy of the step. array to not directly modify the original
        const newSteps = [...manualSteps];

        newSteps[index][stepName] = e.target.value;
        setSteps(newSteps);

    };

    const stepMethodChange = (e) => {
        setStepsMethod(e.target.value);
    }

    //create a new textfield for when the user wants to add another step
    const addStep = (e, index) => {
        setSteps([...manualSteps, { typedStep: '' }])
    };

    //Creates a new input field for the user to add a new ingredient to the list
    const AddIngredient = () => {
        setIngredients([...ingredients, { ingredientName: '' }]);
    }

    {/* hook to handle the ingredient form when it is edited*/ }
    const [ingredients, setIngredients] = useState([{ ingredientName: '' }]);

    {/* hook to handle the steps method functionality and when the use changes their oprions */ }
    const [stepsMethod, setStepsMethod] = useState('manually');

    {/* hook to handle when the list of manual steps are changed*/ }
    const [manualSteps, setSteps] = useState([{ typedStep: '' }])




    return (

        <div>

            {/* Setup the form. I want it to be a popup when the user clicks a plus icon
                on the app. 
            */}
            <Popup trigger={<button> Create Recipe </button>}
                modal nested>
                {
                    close => (
                        <form id='recipeForm'
                            onSubmit={(e) => handleRecipe(e, props.triggerReload, ingredients, manualSteps)}
                            name='recipeForm'
                            action='/maker'
                            method='POST'
                            className='recipeForm'
                            encType='multipart/form-data'
                        >
                            <label htmlFor="title"> Recipe Name: </label>
                            <input id='title' type="text" name='title' placeholder='Enter Recipe Name...' />

                            <label htmlFor="time">Total Cook Time: </label>
                            <input id="time" type="text" name="time" placeholder='Enter Cook Time...' />

                            <br />
                            <label htmlFor="calories">Calories: </label>
                            <input id="calories" type="text" name="calories" placeholder='Calorie Amount..' />

                            <label htmlFor="servings">Servings: </label>
                            <input id="servings" type="text" name="servings" placeholder='Servings' />



                            {/* Dynamic ingredient form that allows the user to add 
                                as many ingredients as they want.
                                Referenced from: https://www.geeksforgeeks.org/reactjs/how-to-build-dynamic-forms-in-react/ */}
                            <label htmlFor="ingredients">Ingredients: </label>

                            <div id="ingredients">
                                {ingredients.map((ingredient, index) => (

                                    <div key={index}>
                                        <input id="ingredientName" type="text"
                                            name="ingredientName" placeholder='List Ingredient'
                                            value={ingredient.ingredientName}
                                            onChange={(e) => handleIngredientChange(e, index)} />
                                    </div>
                                ))}

                                <button type='button' onClick={AddIngredient}>Add More Ingredients</button>

                            </div>

                            {/* this is to handle the three options that the user has to 
                                enter the steps to cook the meal.
                                - Enter manually: an array of strings where the user types in the steps
                                - link: the user enters a link to where they got the recipe/the steps
                                - file upload: the user can upload a document or image of the steps 
                                - ONE of the three is mandatory */}
                            <label htmlFor="stepsMethod">Steps Method</label>
                            <select name="stepsMethod"
                                id="stepsMethod" value={stepsMethod}
                                onChange={(e) => stepMethodChange(e)}>
                                <option value="manually">Enter Manually</option>
                                <option value="link">Link</option>
                                <option value="fileUpload">Upload File</option>
                            </select>

                            {/* render a specfic set of html based on what the user selected from the dropdown */}
                            {stepsMethod === 'manually' && (

                                //if it is steps, make a dynamic list for the user to enter the steps
                                <div id='manualSteps'>
                                    <label htmlFor="steps"> Enter Steps Here: </label>

                                    {/* use the same dynamic list structure as the ingredients */}
                                    {manualSteps.map((step, index) => (

                                        <div key={index}>

                                            <input id="typedStep" type="text"
                                                name="typedStep" placeholder='Enter Step...'
                                                value={step.typedStep}
                                                onChange={(e) => stepChange(e, index)} />


                                        </div>

                                    ))}
                                    <button type='button' onClick={addStep}>Add Step</button>



                                </div>
                            )}


                            {stepsMethod === 'link' && (

                                //if they choose link, then just make a text box to enter the link to the recipe
                                <div id='linkSteps'>
                                    <label htmlFor="link">Link To Recipe: </label>
                                    <input id="link" type="text" name="link" placeholder='Recipe Link...' />

                                </div>
                            )}

                            {stepsMethod === 'fileUpload' && (

                                //if a fileupload, then make a button to upload the file

                                <div id='fileSteps'>
                                    <input id='uploadedFile' type="file" name="sampleFile" />
                                </div>
                            )}

                            <label htmlFor="rating">Rating: </label>
                            <input id="rating" type="number" name="rating" min="0" max="10" />


                            <input type="submit" className='makeRecipeSubmit' value="Add Recipe" />
                        </form>
                    )
                }

            </Popup>

        </div>



    );
};

const UpdateForm = (props) => {

    return (

        <form action="/updateRecipe"
            name='updateForm'
            className='recipeForm'
            method='POST'
            onSubmit={(e) => handleUpdate(e, props.triggerReload)}>

            <label htmlFor="name"> Name: </label>
            <input id='name' type="text" name='name' placeholder='Recipe Update Name' />

            <label htmlFor="age">Updated Age: </label>
            <input id="age" type="number" name="age" min="0" />

            <input type="submit" className='makeRecipeSubmit' value="Update Recipe" />

        </form>


    );
}

const RecipeList = (props) => {

    const [recipes, setRecipes] = useState(props.recipes || []);

    useEffect(() => {
        const loadRecipesFromServer = async () => {
            const response = await fetch('/getRecipes');
            const data = await response.json();
            setRecipes(data.recipes || []);
        };
        loadRecipesFromServer();
    }, [props.reloadRecipes]);


    if (recipes.length === 0) {

        return (
            <div className='recipeList'>
                <h3 className='emptyRecipe'>No Recipes Yet!</h3>
            </div>
        );
    }

    const recipeNodes = recipes.map(recipe => {
        return (

            <div key={recipe.id} className='recipe'>
                <img src="/assets/img/domoface.jpeg" alt="recipe face" className='recipeFace' />
                <h3 className='recipeName'> Name: {recipe.name}</h3>
                <h3 className='recipeDiet'> Diet: {recipe.diet}</h3>
                <h3 className='recipeAge'> Age: {recipe.age}</h3>
            </div>
        );
    });

    return (
        <div className='recipeList'>
            {recipeNodes}
        </div>
    );
}


const App = () => {

    const [reloadRecipes, setReloadRecipes] = useState(false);

    return (

        <div>
            <div id='makeRecipe'>
                <RecipeForm triggerReload={() => setReloadRecipes(!reloadRecipes)} />

            </div>
            {/* <div id='updateRecipe'>

                <UpdateForm triggerReload={() => setReloadRecipes(!reloadRecipes)} />

            </div> */}

            <div id='recipes'>
                <RecipeList recipes={[]} reloadRecipes={reloadRecipes} />

            </div>
        </div>

    );

};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
}

window.onload = init;