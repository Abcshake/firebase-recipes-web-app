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
  }, [user])

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  async function fetchRecipes() {
    let fetchedRecipes = [];
    try {
      const response = await FirebaseFirestoreService.readDocument("recipes");
      const newRecipes = response.docs.map((recipe) => {
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

      alert(`successfully created a recipe with an ID = ${responde.id}`)
    } catch (error) {
      alert(error.message);
    }
  }
  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
          <LoginForm existingUser={user}></LoginForm>
      </div>
      <div className="main">
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
