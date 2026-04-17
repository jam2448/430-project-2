import Popup from 'reactjs-popup';

const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


const handleRecipe = (e, onRecipeAdded) => {
    e.preventDefault();
    helper.hideError();

    const title = e.target.querySelector("#title").value;
    const ingredients = e.target.querySelector('#ingredients').value;
    const time = e.target.querySelector('#time').value;
    const rating = e.target.querySelector('#rating').value;


    //if the user does not enter these fields, send an error
    if (!title || !time || !rating || !ingredients) {
        helper.handleError("Title, Time, Rating, and Ingredients are Required");
        return false;
    }

    helper.sendPost(e.target.action, { title, ingredients, time, rating }, onRecipeAdded);
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

//handles when the user modifies one of the ingredients so that it gets handles properly 
const handleIngredientChange = (e, index) => {

    //get the name of the ingredient to be modified
    const ingName = e.target.ingredientName;

    //create a copy of the ing. array to not directly modify the original
    const newIngredients = [...ingredients];

    newIngredients[index][ingName] = e.target.value;
    setIngredients(newIngredients);

};

//Creates a new input field for the user to add a new ingredient to the list

const AddIngredient = () => {
    setIngredients([...ingredients, {ingredientName: ''}]);
}



const RecipeForm = (props) => {

    {/* hook to handle the ingredient form when it is edited*/}
    const [ingredients, setIngredients] = useState([{ingredientName: ''}]);


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
                            onSubmit={(e) => handleRecipe(e, props.triggerReload)}
                            name='recipeForm'
                            action='/maker'
                            method='POST'
                            className='recipeForm'
                        >
                            <label htmlFor="title"> Recipe Name: </label>
                            <input id='title' type="text" name='title' placeholder='Enter Recipe Name...' />

                            <label htmlFor="time">Total Cook Time: </label>
                            <input id="time" type="text" name="time" placeholder='Enter Cook Time...' />

                            <label htmlFor="rating">Rating: </label>
                            <input id="rating" type="number" name="age" min="0" max="10" />

                            <label htmlFor="calories">Calories: </label>
                            <input id="calories" type="text" name="calories" placeholder='Calorie Amount..' />

                            <label htmlFor="servings">Servings: </label>
                            <input id="servings" type="text" name="servings" placeholder='Servings' />

                            {/* Dynamic ingredient form that allows the user to add 
                                as many ingredients as they want.
                                Referenced from: https://www.geeksforgeeks.org/reactjs/how-to-build-dynamic-forms-in-react/ */}
                            <label htmlFor="ingredients">Ingredients: </label>

                                <form id="ingredients">
                                    {ingredients.map((ingredient, index) =>(
                                        
                                        <div key={index}>
                                            <input id="ingredientName" type="text" 
                                            name="ingredientName" placeholder='List Ingredient' 
                                            value={ingredient.ingredientName}
                                            onChange={(e) => handleIngredientChange(e, index)}/>
                                        </div>
                                    ))}

                                    <button onClick={AddIngredient}>Add More Ingredient</button>

                                </form>




                            


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

    const [recipes, setRecipes] = useState(props.recipes);

    useEffect(() => {
        const loadRecipesFromServer = async () => {
            const response = await fetch('/getRecipes');
            const data = await response.json();
            setRecipes(data.recipes);
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
                <img src="/assets/img/recipeface.jpeg" alt="recipe face" className='recipeFace' />
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
            <div id='updateRecipe'>

                <UpdateForm triggerReload={() => setReloadRecipes(!reloadRecipes)} />

            </div>

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