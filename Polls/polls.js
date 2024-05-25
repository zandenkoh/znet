/*// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAaYarZ9GRra00k3-bZ3i3Yq7Z29JKBGlQ",
  authDomain: "chat-f6c20.firebaseapp.com",
  projectId: "chat-f6c20",
  storageBucket: "chat-f6c20.appspot.com",
  messagingSenderId: "589761348145",
  appId: "1:589761348145:web:3e23e78556f53704198b10"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function createPoll() {
  const question = document.getElementById('question').value;
  const options = [];
  const optionInputs = document.querySelectorAll('#options input');
  optionInputs.forEach((input) => {
    if (input.value.trim() !== '') {
      options.push({ text: input.value, votes: 0 });
    }
  });

  const userName = localStorage.getItem('name');

  if (question.trim() !== '' && options.length > 1 && userName) {
    const pollsRef = database.ref('polls');
    const newPollRef = pollsRef.push();
    newPollRef.set({
      question,
      options,
      userName
    });
    app.closePopup();
  } else {
    alert('Please enter a question, at least two options, and your name.');
  }
}

function addOptionInput() {
  const optionsContainer = document.getElementById('options');
  const newOptionInput = document.createElement('input');
  newOptionInput.type = 'text';
  newOptionInput.placeholder = 'Option';
  optionsContainer.appendChild(newOptionInput);
}

function displayPolls() {
  const pollsContainer = document.getElementById('polls-container');

  database.ref('polls').on('child_added', (snapshot) => {
    const poll = snapshot.val();
    const pollElement = createPollElement(poll, snapshot.key);
    pollsContainer.prepend(pollElement); // Prepend instead of append
  });

  database.ref('polls').on('child_changed', (snapshot) => {
    const poll = snapshot.val();
    const pollElement = pollsContainer.querySelector(`[data-poll-id="${snapshot.key}"]`);
    updatePollElement(pollElement, poll, snapshot.key);
  });

  database.ref('polls').on('child_removed', (snapshot) => {
    const pollElement = pollsContainer.querySelector(`[data-poll-id="${snapshot.key}"]`);
    pollsContainer.removeChild(pollElement);
  });
}


function createPollElement(poll, pollId) {
  const pollElement = document.createElement('div');
  pollElement.classList.add('poll');
  pollElement.dataset.pollId = pollId;

  const pollHeaderElement = document.createElement('div');
  pollHeaderElement.classList.add('poll-header');

  const profileCircle = document.createElement('div');
  profileCircle.classList.add('profile-circle');
  const firstLetterElement = document.createElement('span');
  firstLetterElement.classList.add('first-letter');
  firstLetterElement.textContent = poll.userName.charAt(0).toUpperCase();
  profileCircle.appendChild(firstLetterElement);

  const nameElement = document.createElement('h2');
  nameElement.classList.add('poll-name');
  nameElement.style.fontSize = '17px';
  nameElement.style.fontWeight = '700';
  nameElement.textContent = poll.userName;

  pollHeaderElement.appendChild(profileCircle);
  pollHeaderElement.appendChild(nameElement);
  pollElement.appendChild(pollHeaderElement);

  const questionElement = document.createElement('h2');
  questionElement.textContent = poll.question;
  pollElement.appendChild(questionElement);

  const optionsContainer = document.createElement('div');
  optionsContainer.classList.add('options-container');
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  poll.options.forEach((option, optionIndex) => {
    const optionElement = document.createElement('div');
    optionElement.classList.add('option');
    optionElement.dataset.optionIndex = optionIndex;
  
    // Check if the current user has voted on this option
    const userName = localStorage.getItem('name');
    const userVoteKey = `poll-${pollId}-${userName}-option`;
    const isOptionVoted = localStorage.getItem(userVoteKey) === `${optionIndex}`;
  
    const optionTextElement = document.createElement('span');
    optionTextElement.classList.add('option-option');
    optionTextElement.textContent = option.text;
    const voteBarContainer = document.createElement('div');
    voteBarContainer.classList.add('vote-bar-container');
    const voteBar = document.createElement('div');
    voteBar.classList.add('vote-bar');
    voteBar.style.width = `${(option.votes / totalVotes) * 100}%`;
    voteBarContainer.appendChild(voteBar);
    const optionVotesElement = document.createElement('span');
    optionVotesElement.classList.add('option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;
    optionElement.appendChild(optionTextElement);
    optionElement.appendChild(voteBarContainer);
    optionElement.appendChild(optionVotesElement);
  
    // Add 'disabled' and 'voted' classes only if the user has voted on this option
    if (isOptionVoted) {
      optionElement.classList.add('disabled');
      optionElement.classList.add('voted');
    }
  
    optionElement.addEventListener('click', () => {
      // Remove 'disabled' and 'voted' classes from all options
      const allOptions = optionsContainer.querySelectorAll('.option');
      allOptions.forEach((opt) => {
        opt.classList.remove('disabled');
        opt.classList.remove('voted');
      });
    
      // Apply 'disabled' and 'voted' classes to the clicked option
      optionElement.classList.add('disabled');
      optionElement.classList.add('voted');
    
      // Call voteOnOption function to handle voting
      voteOnOption(pollId, optionIndex, optionElement, poll);
    });
    optionsContainer.appendChild(optionElement);
  });  
  pollElement.appendChild(optionsContainer);

  return pollElement;
}


function voteOnOption(pollId, optionIndex, optionElement, poll) {
  const userName = localStorage.getItem('name');
  const userVoteKey = `poll-${pollId}-${userName}-option`;

  // Get the previously voted option index
  const previouslyVotedOptionIndex = parseInt(localStorage.getItem(userVoteKey));

  // Check if the user has voted for any option
  if (!isNaN(previouslyVotedOptionIndex)) {
    // If the user has voted for the same option as the one clicked
    if (previouslyVotedOptionIndex === optionIndex) {
      // Do nothing because the user is deselecting their vote
      // Remove the vote from the database and local storage
      poll.options[previouslyVotedOptionIndex].votes--;
      localStorage.removeItem(userVoteKey);
      database.ref(`polls/${pollId}/options/${optionIndex}/votes`).set(poll.options[optionIndex].votes);
    } else {
      // If the user has voted for a different option, remove their previous vote
      poll.options[previouslyVotedOptionIndex].votes--;
      database.ref(`polls/${pollId}/options/${previouslyVotedOptionIndex}/votes`).set(poll.options[previouslyVotedOptionIndex].votes);
      // Remove 'disabled' and 'voted' classes from the previously selected option
      const previousOptionElement = document.querySelector(`[data-poll-id="${pollId}"] .option[data-option-index="${previouslyVotedOptionIndex}"]`);
      previousOptionElement.classList.remove('disabled');
      previousOptionElement.classList.remove('voted');
    }
  }

  // Increment the vote count for the current option
  poll.options[optionIndex].votes++;

  // Store the user's new vote in the local storage
  localStorage.setItem(userVoteKey, `${optionIndex}`);

  // Update the database with the new vote count for the current option
  database.ref(`polls/${pollId}/options/${optionIndex}/votes`).set(poll.options[optionIndex].votes);

  // Apply 'disabled' and 'voted' classes to the clicked option
  optionElement.classList.add('disabled');
  optionElement.classList.add('voted');
}


function updatePollElement(pollElement, poll, pollId) {
  const questionElement = pollElement.querySelector('h2:not(.poll-name)');
  questionElement.textContent = poll.question;

  const optionsContainer = pollElement.querySelector('.options-container');
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  poll.options.forEach((option, optionIndex) => {
    const optionElement = optionsContainer.children[optionIndex];
    const voteBar = optionElement.querySelector('.vote-bar');
    voteBar.style.width = `${(option.votes / totalVotes) * 100}%`;
    const optionVotesElement = optionElement.querySelector('.option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;

    // Check if the option has been voted on and apply the 'disabled' class accordingly
    optionElement.classList.remove('disabled');
    if (option.votes > 0) {
      optionElement.classList.add('disabled');
    }
  });
}

const app = {
  openPopup: function() {
    document.getElementById('popup').style.display = 'block';
    const addOptionButton = document.getElementById('add-option');
    addOptionButton.addEventListener('click', addOptionInput);
  },
  closePopup: function() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('question').value = '';
    document.querySelectorAll('#options input').forEach((input) => {
      input.value = '';
    });
    const addOptionButton = document.getElementById('add-option');
    addOptionButton.removeEventListener('click', addOptionInput);
  },
  createPoll: function() {
    createPoll();
  },
};

// Call the displayPolls function when the page loads
window.onload = function() {
  displayPolls();
};*/


// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAaYarZ9GRra00k3-bZ3i3Yq7Z29JKBGlQ",
  authDomain: "chat-f6c20.firebaseapp.com",
  projectId: "chat-f6c20",
  storageBucket: "chat-f6c20.appspot.com",
  messagingSenderId: "589761348145",
  appId: "1:589761348145:web:3e23e78556f53704198b10"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function createPoll() {
  const question = document.getElementById('question').value;
  const options = [];
  const optionInputs = document.querySelectorAll('#options input');
  optionInputs.forEach((input) => {
    if (input.value.trim() !== '') {
      options.push({ text: input.value, votes: 0 });
    }
  });

  const userName = localStorage.getItem('name');

  if (question.trim() !== '' && options.length > 1 && userName) {
    const pollsRef = database.ref('polls');
    const newPollRef = pollsRef.push();
    newPollRef.set({
      question,
      options,
      userName
    });
    app.closePopup();
  } else {
    alert('Please enter a question and at least two options.');
  }
}

function addOptionInput() {
  const optionsContainer = document.getElementById('options');
  const newOptionInput = document.createElement('input');
  newOptionInput.type = 'text';
  newOptionInput.placeholder = 'Option';
  optionsContainer.appendChild(newOptionInput);
}

function displayPolls() {
  const pollsContainer = document.getElementById('polls-container');

  database.ref('polls').on('child_added', (snapshot) => {
    const poll = snapshot.val();
    const pollElement = createPollElement(poll, snapshot.key);
    pollsContainer.prepend(pollElement);
  });

  database.ref('polls').on('child_changed', (snapshot) => {
    const poll = snapshot.val();
    const pollElement = pollsContainer.querySelector(`[data-poll-id="${snapshot.key}"]`);
    updatePollElement(pollElement, poll, snapshot.key);
  });

  database.ref('polls').on('child_removed', (snapshot) => {
    const pollElement = pollsContainer.querySelector(`[data-poll-id="${snapshot.key}"]`);
    pollsContainer.removeChild(pollElement);
  });
}

function createPollElement(poll, pollId) {
  const pollElement = document.createElement('div');
  pollElement.classList.add('poll');
  pollElement.dataset.pollId = pollId;

  const pollHeaderElement = document.createElement('div');
  pollHeaderElement.classList.add('poll-header');

  const profileCircle = document.createElement('div');
  profileCircle.classList.add('profile-circle');
  const firstLetterElement = document.createElement('span');
  firstLetterElement.classList.add('first-letter');
  firstLetterElement.textContent = poll.userName.charAt(0).toUpperCase();
  profileCircle.appendChild(firstLetterElement);

  const nameElement = document.createElement('h2');
  nameElement.classList.add('poll-name');
  nameElement.style.fontSize = '17px';
  nameElement.style.fontWeight = '700';
  nameElement.textContent = poll.userName;

  pollHeaderElement.appendChild(profileCircle);
  pollHeaderElement.appendChild(nameElement);
  pollElement.appendChild(pollHeaderElement);

  const questionElement = document.createElement('h2');
  questionElement.textContent = poll.question;
  pollElement.appendChild(questionElement);

  const optionsContainer = document.createElement('div');
  optionsContainer.classList.add('options-container');
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  poll.options.forEach((option, optionIndex) => {
    const optionElement = document.createElement('div');
    optionElement.classList.add('option');
    optionElement.dataset.optionIndex = optionIndex;

    const userName = localStorage.getItem('name');
    const userVoteKey = `poll-${pollId}-${userName}-option`;
    const isOptionVoted = localStorage.getItem(userVoteKey) === `${optionIndex}`;

    const optionTextElement = document.createElement('span');
    optionTextElement.classList.add('option-option');
    optionTextElement.textContent = option.text;
    const voteBarContainer = document.createElement('div');
    voteBarContainer.classList.add('vote-bar-container');
    const voteBar = document.createElement('div');
    voteBar.classList.add('vote-bar');
    voteBar.style.width = totalVotes > 0 ? `${(option.votes / totalVotes) * 100}%` : '0%';
    voteBarContainer.appendChild(voteBar);
    const optionVotesElement = document.createElement('span');
    optionVotesElement.classList.add('option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;
    optionElement.appendChild(optionTextElement);
    optionElement.appendChild(voteBarContainer);
    optionElement.appendChild(optionVotesElement);

    if (isOptionVoted) {
      optionElement.classList.add('disabled');
      pollElement.classList.add('disabled-poll');
      setTimeout(() => {
        const pollsContainer = document.getElementById('polls-container');
        pollsContainer.appendChild(pollElement);
      }, 300);
    }

    optionElement.addEventListener('click', () => {
      if (!isOptionVoted && !localStorage.getItem(userVoteKey)) {
        voteOnOption(pollId, optionIndex, optionElement, poll);
      }
    });

    optionsContainer.appendChild(optionElement);
  });
  pollElement.appendChild(optionsContainer);

  return pollElement;
}

function voteOnOption(pollId, optionIndex, optionElement, poll) {
  const userName = localStorage.getItem('name');
  const userVoteKey = `poll-${pollId}-${userName}-option`;

  poll.options[optionIndex].votes++;
  localStorage.setItem(userVoteKey, `${optionIndex}`);

  database.ref(`polls/${pollId}/options/${optionIndex}/votes`).set(poll.options[optionIndex].votes);

  optionElement.classList.add('disabled');
  const pollElement = optionElement.closest('.poll');
  pollElement.classList.add('disabled-poll');

  setTimeout(() => {
    const pollsContainer = document.getElementById('polls-container');
    pollsContainer.appendChild(pollElement);
  }, 600);
}

function updatePollElement(pollElement, poll, pollId) {
  const questionElement = pollElement.querySelector('h2:not(.poll-name)');
  questionElement.textContent = poll.question;

  const optionsContainer = pollElement.querySelector('.options-container');
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  poll.options.forEach((option, optionIndex) => {
    const optionElement = optionsContainer.children[optionIndex];
    const voteBar = optionElement.querySelector('.vote-bar');
    voteBar.style.width = totalVotes > 0 ? `${(option.votes / totalVotes) * 100}%` : '0%';
    const optionVotesElement = optionElement.querySelector('.option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;
  });
}

const app = {
  openPopup: function() {
    document.getElementById('popup').style.display = 'block';
    const addOptionButton = document.getElementById('add-option');
    addOptionButton.addEventListener('click', addOptionInput);
  },
  closePopup: function() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('question').value = '';
    document.querySelectorAll('#options input').forEach((input) => {
      input.value = '';
    });
    const addOptionButton = document.getElementById('add-option');
    addOptionButton.removeEventListener('click', addOptionInput);
  },
  createPoll: function() {
    createPoll();
  },
};

window.onload = function() {
  displayPolls();
};