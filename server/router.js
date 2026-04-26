const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {

    app.get('/getRecipes', mid.requiresLogin, controllers.Recipe.getRecipes);
    app.get('/profitModels', mid.requiresLogin, controllers.Recipe.profitModels);
    app.get('/getAccount', mid.requiresLogin, controllers.Account.getAccount);

    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
    
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    app.get('/logout', mid.requiresLogin, controllers.Account.logout);
    app.get('/maker', mid.requiresLogin, controllers.Recipe.makerPage);
    app.post('/maker', mid.requiresLogin,controllers.Recipe.makeRecipe);
    app.post('/updateRecipe', mid.requiresLogin, controllers.Recipe.updateRecipe);
    app.post('/deleteRecipe', mid.requiresLogin, controllers.Recipe.deleteRecipe);
    app.post('/updatePlan', mid.requiresLogin, controllers.Account.updatePlan);


    
    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);


    

};


module.exports = router;