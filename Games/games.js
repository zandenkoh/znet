/*// Get the name from local storage
var name = localStorage.getItem('name');

var profileCircle = document.getElementById('profile-circle');
var profileLetter = document.getElementById('profile-letter');
var profileName = document.getElementById('profile-name');

profileCircle.style.background = '#ffffff';
profileCircle.style.width = '50px';
profileCircle.style.height = '50px';
profileCircle.style.borderRadius = '50%';
profileCircle.style.color = '#000';
profileCircle.style.fontSize = '20px';
profileCircle.style.fontWeight = '900';
profileCircle.style.alignItems = 'center';
profileCircle.style.justifyContent = 'center';
profileCircle.style.display = 'flex';

profileName.style.color = '#fff';
profileName.style.fontSize = '15px';
profileName.style.fontWeight = '900';

// Check if the name exists in local storage
if (name !== null) {
  // Display the first letter of the name in the profile circle
  profileLetter.textContent = name.charAt(0).toUpperCase();

  // Display the full name
  profileName.textContent = name;
} else {
  // Handle the case when the name is not available in local storage
  profileLetter.textContent = '';
  profileName.textContent = '';
}


var chat = document.getElementById('chat');

chat.addEventListener('click', () => {
  window.location.href = "../index.html";
});*/

/*// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAhH1EKxSanB1Kb0wHdBgIk1PYJu2eJ9IE",
  authDomain: "games-266f7.firebaseapp.com",
  projectId: "games-266f7",
  storageBucket: "games-266f7.appspot.com",
  messagingSenderId: "863641160518",
  appId: "1:863641160518:web:8dcff5d78ffaf4628ff347"
};
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

const gameData = {
  imageUrl: "https://example.com/game-image.jpg",
  title: "Game Title",
  description: "This is the game description.",
  author: "Game Author",
  stars: 4
};

db.collection("games").add(gameData)
  .then((docRef) => {
    console.log("Game added with ID: ", docRef.id);
  })
  .catch((error) => {
    console.error("Error adding game: ", error);
  });

let lastVisible; // Keep track of the last visible document
const batchSize = 10; // Number of games to display at a time

function fetchGames(searchTerm = '') {
  const gamesRef = db.collection('games');

  // Apply search filter if a search term is provided
  let query = searchTerm
    ? gamesRef.where('title', 'array-contains', searchTerm.toLowerCase())
    : gamesRef;

  // Fetch the next batch of games
  query = query.limit(batchSize);
  if (lastVisible) {
    query = query.startAfter(lastVisible);
  }

  query.get().then((querySnapshot) => {
    const gameContainer = document.getElementById('gameContainer');
    querySnapshot.forEach((doc) => {
      const game = doc.data();
      const gameCard = createGameCard(game);
      gameContainer.appendChild(gameCard);
    });

    // Update the last visible document
    const documents = querySnapshot.docs;
    lastVisible = documents[documents.length - 1];

    // Check if there are more games to load
    const hasMore = querySnapshot.size === batchSize;
    if (hasMore) {
      // Attach an event listener to load more games when scrolling to the bottom
      window.addEventListener('scroll', handleScroll);
    } else {
      window.removeEventListener('scroll', handleScroll);
    }
  });
}

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  document.getElementById('gameContainer').innerHTML = '';
  lastVisible = null; // Reset the last visible document
  fetchGames(searchTerm);
});

fetchGames();*/

// Get the search input field
const searchInput = document.getElementById('searchInput');

// Add an event listener for the 'keyup' event
searchInput.addEventListener('keyup', function(event) {
  // Check if the Enter key was pressed
  if (event.key === 'Enter') {
    // Get the search query from the input field and split it by spaces
    const searchQuery = searchInput.value.trim().toLowerCase();
    const keywords = searchQuery.split(' ').filter(keyword => keyword.length > 0);

    // Construct the new URL with the search query as a parameter
    const newUrl = `${window.location.origin}${window.location.pathname}?search=${encodeURIComponent(searchQuery)}`;

    // Redirect the page to the new URL
    window.location.href = newUrl;
  }
});

// Get the search query from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('search') || '';

// Get all the game cards
const gameCards = document.querySelectorAll('.game-card');

// Loop through each game card
gameCards.forEach(function(card) {
  // Get the game title and description
  const title = card.querySelector('h3').textContent.toLowerCase();
  const description = card.querySelector('.description').textContent.toLowerCase();

  // Get the keywords from the search query and check if any of them match the title or description
  const keywords = searchQuery.split(' ').filter(keyword => keyword.length > 0);
  const isMatch = keywords.some(keyword => title.includes(keyword) || description.includes(keyword));

  // Show or hide the game card based on the match
  card.style.display = isMatch ? 'block' : 'none';
});

function applySearchResultLayout() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  const gameCards = document.querySelectorAll('.game-card');
  const gameCardsContainer = document.querySelector('.game-cards');

  if (searchQuery) {
    gameCardsContainer.classList.add('search-results');
    gameCards.forEach(card => card.classList.add('search-result'));
    
    // Loop through each game card
    gameCards.forEach(function(card) {
      // Get the game title and description
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('.description').textContent.toLowerCase();

      // Get the keywords from the search query and check if any of them match the title or description
      const keywords = searchQuery.split(' ').filter(keyword => keyword.length > 0);
      const isMatch = keywords.some(keyword => title.includes(keyword) || description.includes(keyword));

      // Show or hide the game card based on the match
      card.style.display = isMatch ? 'block' : 'none';
    });
  } else {
    gameCardsContainer.classList.remove('search-results');
    gameCards.forEach(card => card.classList.remove('search-result'));

    // Show all game cards
    gameCards.forEach(card => card.style.display = 'block');
  }

  // Update the page title to include the search query
  document.title = searchQuery ? `"${searchQuery}" Games on ZNet` : 'ZNet';
}

// Call the function on page load
window.addEventListener('load', applySearchResultLayout);

// Call the function whenever the URL changes
window.addEventListener('popstate', applySearchResultLayout);

document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tabs button');
  const gameCards = document.querySelectorAll('.game-card');
  const allButton = document.querySelector('.button-all');

  tabs.forEach(tab => {
      tab.addEventListener('click', function() {
          const keyword = tab.textContent.trim().toLowerCase();
          updateURLWithKeyword(keyword);
      });
  });

  allButton.addEventListener('click', function() {
      updateURLWithKeyword('');
      document.title = 'ZNet';
  });

  function updateURLWithKeyword(keyword) {
      const newUrl = keyword ? `${window.location.origin}${window.location.pathname}?search=${encodeURIComponent(keyword)}` : `${window.location.origin}${window.location.pathname}`;
      window.location.href = newUrl;
  }

  function applySearchResultLayout() {
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('search');
      
      if (searchQuery) {
          // Filter game cards based on the search query
          gameCards.forEach(card => {
              const title = card.querySelector('h3').textContent.toLowerCase();
              const description = card.querySelector('.description').textContent.toLowerCase();
              const isMatch = title.includes(searchQuery) || description.includes(searchQuery);
              card.style.display = isMatch ? 'block' : 'none';
          });

          // Add a special CSS class to the active tab
          tabs.forEach(tab => {
              const tabKeyword = tab.textContent.trim().toLowerCase();
              tab.classList.toggle('active', tabKeyword === searchQuery);
          });
      } else {
          // Show all game cards and remove the special CSS class from all tabs
          gameCards.forEach(card => card.style.display = 'block');
          tabs.forEach(tab => tab.classList.remove('active'));
      }
  }

  // Call the function on page load
  applySearchResultLayout();

  // Call the function whenever the URL changes
  window.addEventListener('popstate', applySearchResultLayout);
});



window.addEventListener("load", function () {
  // Hide loading screen when everything is loaded
  var loadingScreen = document.getElementById("loadingScreen");
  var content = document.getElementById("content");

  loadingScreen.style.transition = "opacity 0.5s";
  loadingScreen.style.opacity = "0";

  // After fade out, set display to none
  setTimeout(function() {
      loadingScreen.style.display = "none";
      content.style.display = "block"; // Show content
  }, 500); // 0.5 seconds transition

});























document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.getElementById("gameContainer");
  const cards = Array.from(cardContainer.getElementsByClassName("game-card"));
  
  // Function to shuffle an array
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }

  // Shuffle the cards
  const shuffledCards = shuffleArray(cards);

  // Clear the container
  cardContainer.innerHTML = "";

  // Append the shuffled cards
  shuffledCards.forEach(card => cardContainer.appendChild(card));
});
