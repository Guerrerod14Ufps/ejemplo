// Función para obtener las categorías desde la API
function getCategories() {
  fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list')
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById('categorySelect');
      data.drinks.forEach(category => {
        const option = document.createElement('option');
        option.value = category.strAlcoholic;
        option.textContent = category.strAlcoholic;
        categorySelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error al obtener categorías:', error));
}

// Función para obtener los ingredientes desde la API
function getIngredients() {
  fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list')
    .then(response => response.json())
    .then(data => {
      const ingredientSelect = document.getElementById('ingredientSelect');
      data.drinks.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.strIngredient1;
        option.textContent = ingredient.strIngredient1;
        ingredientSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error al obtener ingredientes:', error));
}

// Inicializar los selectores de ingredientes y categorías al cargar la página
function initializeSelectBoxes() {
  getCategories();
  getIngredients();
}

// Función para manejar la búsqueda y redirigir a la página de resultados
function handleSearch() {
  const name = document.getElementById('nameInput').value;
  const ingredient = document.getElementById('ingredientSelect').value;
  const category = document.getElementById('categorySelect').value;
  let url = '';

  // Priorizar búsqueda por nombre, luego por ingrediente, y finalmente por categoría
  if (name) {
    url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`;
  } else if (ingredient) {
    url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;
  } else if (category) {
    url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${category}`;
  } else {
    alert('Por favor, selecciona al menos un criterio de búsqueda.');
    return;
  }

  // Realizar la solicitud a la API y guardar los resultados en localStorage
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.drinks) {
        localStorage.setItem('cocktailResults', JSON.stringify(data.drinks));
        window.location.href = '../html/results.html'; // Redirigir a la página de resultados
      } else {
        alert('No se encontraron resultados.');
      }
    })
    .catch(error => console.error('Error en la búsqueda:', error));
}

// Función para mostrar los resultados en la página de resultados
function displayResults() {
  const results = JSON.parse(localStorage.getItem('cocktailResults'));
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpiar los resultados previos

  if (results) {
    results.forEach(drink => {
      const card = document.createElement('div');
      card.className = 'card';
      card.onclick = function() { goToCocktail(drink.idDrink); }; // Añadir evento de clic

      const img = document.createElement('img');
      img.src = drink.strDrinkThumb;
      img.alt = drink.strDrink;

      const title = document.createElement('h3');
      title.textContent = drink.strDrink;

      card.appendChild(img);
      card.appendChild(title);
      resultsDiv.appendChild(card);
    });
  } else {
    resultsDiv.textContent = 'No se encontraron resultados.';
  }
}

// Función para redirigir a la página de detalles del cóctel
function goToCocktail(idDrink) {
  // Guardar el ID del cóctel en localStorage
  localStorage.setItem('selectedCocktailId', idDrink);
  window.location.href = '../html/cocktail.html'; // Redirigir a la página de detalles
}

// Función para obtener detalles de un ingrediente
function getIngredientDetails(ingredientName) {
  fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${ingredientName}`)
    .then(response => response.json())
    .then(data => {
      if (data.ingredients) {
        const ingredient = data.ingredients[0];
        showIngredientPopup(ingredient);
      } else {
        alert('No se encontraron detalles para este ingrediente.');
      }
    })
    .catch(error => console.error('Error al obtener detalles del ingrediente:', error));
}

// Función para mostrar el pop-up con la información del ingrediente
function showIngredientPopup(ingredient) {
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close" onclick="closePopup()">&times;</span>
      <h2>${ingredient.strIngredient}</h2>
      <p>${ingredient.strDescription || 'No hay descripción disponible.'}</p>
      <img src="${ingredient.strImage || ''}" alt="${ingredient.strIngredient}" style="max-width: 100%;">
    </div>
  `;
  document.body.appendChild(popup);
}

// Función para cerrar el pop-up
function closePopup() {
  const popup = document.querySelector('.popup');
  if (popup) {
    popup.remove();
  }
}

// Función para mostrar los detalles del cóctel en la página de detalles
function displayCocktailDetails() {
  const idDrink = localStorage.getItem('selectedCocktailId');
  if (!idDrink) {
    alert('No se seleccionó ningún cóctel.');
    return;
  }

  // Obtener los detalles del cóctel desde la API
  fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idDrink}`)
    .then(response => response.json())
    .then(data => {
      const cocktail = data.drinks[0];
      document.getElementById('cocktailName').textContent = cocktail.strDrink;
      document.getElementById('cocktailImage').src = cocktail.strDrinkThumb;
      document.getElementById('cocktailDescription').textContent = cocktail.strInstructions;

      const ingredientsList = document.getElementById('cocktailIngredients');
      ingredientsList.innerHTML = ''; // Limpiar ingredientes previos
      for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`strIngredient${i}`];
        const measure = cocktail[`strMeasure${i}`];
        if (ingredient) {
          const listItem = document.createElement('li');
          listItem.textContent = `${measure ? measure + ' ' : ''}${ingredient}`;
          listItem.onclick = function() {
            getIngredientDetails(ingredient); // Llamar a la función al hacer clic
          };
          ingredientsList.appendChild(listItem);
        }
      }
    })
    .catch(error => console.error('Error al obtener detalles del cóctel:', error));
}

// Función para regresar a la página de resultados
function goBack() {
  window.location.href = '../html/results.html';
}

// Inicializar los combo boxes con datos dinámicos de la API al cargar la página
window.onload = function() {
  if (window.location.pathname.includes('results.html')) {
    displayResults(); // Si estamos en la página de resultados, mostrar los resultados
  } else if (window.location.pathname.includes('cocktail.html')) {
    displayCocktailDetails(); // Si estamos en la página de detalles, mostrar los detalles del cóctel
  } else {
    initializeSelectBoxes(); // Si estamos en la página de búsqueda, inicializar los selectores
  }
};
