import { useEffect, useState } from "react";
import FirebaseAuthService from './FirebaseAuthService';
import LoginForm from './components/LoginForm';
import './App.scss';
import AddEditRecipeForm from "./components/AddEditRecipeForm";
import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes()
      .then((fetchRecipes) => {
        setRecipes(fetchRecipes);
      })
      .catch((error) => {
        console.log(error.message);
        throw error;
      })
       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  async function fetchRecipes() {
    const queries = [];

    if(!user){
      queries.push({
        field: 'isPublished',
        condition: "==",
        value: true,
      });
    }

    let fetchedRecipes = [];
    try {
      const response = await FirebaseFirestoreService.readDocument({
        collection: "recipes",
        queries: queries,
      });
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds*1000);

        return { ...data, id };
      });
      fetchedRecipes = [...newRecipes];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    return fetchedRecipes;
  }

  async function handleFetchRecipes() {
    try {
      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async function handleAddRecipe(newRecipe) {
    try{
      const response = await FirebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
        );
      //fetch new recipes from firestore
     handleFetchRecipes();

      alert(`successfully created a recipe with an ID = ${response.id}`)
    } catch (error) {
      alert(error.message);
    }
  }
  function lookupCategoryLabel(categoryKey) {
    const categories = {
      breadsSandwichesandPizza: "Bread, Sandwiches, and Pizza",
      eggsAndBreakfast: "Eggs & Breakfast",
      dessertsandBakedGoods: "Desserts & Baked Goods",
      fishandSeafood: "Fish & Seafood",
      vegetables: "Vegetables"
    };
    const label = categories[categoryKey];
    return label;
  }

  function formatDate(date) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${month}-${day}-${year}`;

    return dateString;
  }

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
          <LoginForm existingUser={user}></LoginForm>
      </div>
      <div className="main">
        <div className="center">
          <div className="recipe-list-box">
            {
              recipes && recipes.length > 0 ? (
                <div className="recipe-list">
                  {
                    recipes.map((recipe) => {
                      return (
                        <div className="recipe-card" key={recipe.id}>
                          {
                            recipe.isPublished === false ? (
                              <div className="unpublished">UNPUBLISHED</div>
                            ) : null
                          }
                          <div className="recipe-name">{recipe.name}</div>
                          <div className="recipe-field">Category: {lookupCategoryLabel(recipe.category)}</div>
                          <div className="recipe-field">Publish Date:{formatDate(recipe.publishDate)}</div>
                        </div>
                      )
                    })
                  }
                </div>
              ) : null
            }
          </div>
        </div>
        {
          user ? <AddEditRecipeForm
          handleAddRecipe={handleAddRecipe}
        ></AddEditRecipeForm> : null
        }    
      </div>
    </div>
  );
}

export default App;
