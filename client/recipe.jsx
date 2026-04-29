

const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');
import { useLocation, useParams } from 'react-router-dom';
const { useState, useEffect } = React;


//this page displays the full content of the recipe so that the user can
//access it ans use it when they want to view it
const RecipePage = (props) => {

    //get the id from the url 
    const id = window.location.pathname.split('/').pop();

    //setup a hook to be able to make the page change based on the recipe
    const [recipe, setRecipe] = useState(null);

    //use effect to load in the data of the recipe from the db
    //make sure to pass the id as a dependency because the component is dependent on the id
    useEffect(() => {
        const loadRecipe = async () => {
            const response = await fetch(`/getRecipe/${id}`);
            const data = await response.json();
            setRecipe(data.recipe);
        };
        loadRecipe();
    }, []);

    console.log(recipe);

    //Safeguard against the app crashing when it is fetching the recipe
    if (!recipe) return <h1>Loading...</h1>


    return (

        <div id='recipeContent'>
            <h1>{recipe.title}</h1>
            <hr />

            <div id='basicInfo'>

                <div id='servings'>
                    <h2 id='servingsLabel'>Servings</h2>
                    <h2 id='servingsData'>{recipe.servings}</h2>
                </div>

                <div id='calories'>
                    <h2 id='caloriesLabel'>Calories</h2>
                    <h2 id='caloriesData'>{recipe.calories}</h2>
                </div>
                
                <div id='cookTime'>
                    <h2 id='timeLabel'>Cook Time</h2>
                    <h2 id='timeData'>{recipe.time}</h2>
                </div>

            </div>


            <div id='detailedInfo'>


                <div>

                    <h3>Ingredients</h3>
                    <ul>
                        {/* print out all of the ingredients in the list */}
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>

                </div>






                {recipe.link && (

                    <div className='recipeLink'>
                        <h3 id='linkLabel'>Recipe Link </h3>

                        <a href={recipe.link}><h4 id='linkData'>{recipe.link}</h4></a>
                    </div>

                )}

                {/* if the entered manual steps, then print it out */}
                {recipe.steps.length !== 0 && (

                    <div className='recipeSteps'>

                        <h3>Steps</h3>
                        <ol>
                            {/* print out all of the manual steps in the list */}
                            {recipe.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}

                        </ol>

                    </div>

                )}


                {/*retrieve the file and download it with the push of a button by getting the id of the recipe */}
                {recipe.fileData && (

                    <div id='recipeFile'>

                        <h3>Recipe File</h3>
                        <a href={`/getRecipeFile/${recipe._id}`} download>
                            <button id='downloadButton'>Download Recipe File</button>
                        </a>

                    </div>
                )}

            </div>

        </div>

    );
}


//keep the init in case the user relaods the page
const init = () => {
    const root = createRoot(document.getElementById('recipeContent'));
    root.render(<RecipePage />);
}

window.onload = init;

//export the component it so that the maker page can import it
export default RecipePage;
