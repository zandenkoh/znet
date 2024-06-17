/*// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAaYarZ9GRra00k3-bZ3iYq7Z29JKBGlQ",
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

  database.ref('polls').once('value', (snapshot) => {
    const polls = [];
    snapshot.forEach((childSnapshot) => {
      const poll = childSnapshot.val();
      poll.id = childSnapshot.key;
      polls.push(poll);
    });

    // Shuffle polls to display in random order
    for (let i = polls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [polls[i], polls[j]] = [polls[j], polls[i]];
    }

    // Display the first poll
    if (polls.length > 0) {
      displaySinglePoll(polls, 0);
    }
  });
}

function displaySinglePoll(polls, index) {
  const pollsContainer = document.getElementById('polls-container');
  pollsContainer.innerHTML = ''; // Clear existing poll

  if (index >= polls.length) {
    // All polls have been shown
    return;
  }

  const poll = polls[index];
  const pollElement = createPollElement(poll, poll.id);

  pollsContainer.appendChild(pollElement);

  // Handle voting animation and display the next poll
  pollElement.querySelectorAll('.option').forEach((optionElement, optionIndex) => {
    optionElement.addEventListener('click', () => {
      setTimeout(() => {
        pollElement.classList.add('fly-up'); // Add fly up animation class
        setTimeout(() => {
          displaySinglePoll(polls, index + 1); // Display next poll
        }, 500); // Match this duration with the fly up animation duration
      }, 500); // Delay to allow the voting action to complete
    });
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

  // Increment the vote count for the selected option
  poll.options[optionIndex].votes++;

  // Update database with new vote count
  database.ref(`polls/${pollId}/options/${optionIndex}/votes`).set(poll.options[optionIndex].votes);

  // Update UI for all options in the same poll
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  const optionsContainer = optionElement.parentElement;
  poll.options.forEach((option, index) => {
    const optionElement = optionsContainer.children[index];
    const voteBar = optionElement.querySelector('.vote-bar');
    voteBar.style.width = totalVotes > 0 ? `${(option.votes / totalVotes) * 100}%` : '0%';
    const optionVotesElement = optionElement.querySelector('.option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;
  });

  // Disable the option to prevent multiple votes
  optionElement.classList.add('disabled');
  const pollElement = optionElement.closest('.poll');
  pollElement.classList.add('disabled-poll');

  setTimeout(() => {
    const pollsContainer = document.getElementById('polls-container');
    pollsContainer.appendChild(pollElement);
  }, 600);
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
};*/






















































/*// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAaYarZ9GRra00k3-bZ3iYq7Z29JKBGlQ",
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
  const userName = localStorage.getItem('name');

  database.ref('polls').once('value', (snapshot) => {
    const polls = [];
    snapshot.forEach((childSnapshot) => {
      const poll = childSnapshot.val();
      poll.id = childSnapshot.key;

      // Check if the user has voted on this poll
      const userVoteKey = `poll-${poll.id}-${userName}-option`;
      if (!localStorage.getItem(userVoteKey)) {
        polls.push(poll);
      }
    });

    // Shuffle polls to display in random order
    for (let i = polls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [polls[i], polls[j]] = [polls[j], polls[i]];
    }

    // Display the first poll
    if (polls.length > 0) {
      displaySinglePoll(polls, 0);
    }
  });
}

function displaySinglePoll(polls, index) {
  const pollsContainer = document.getElementById('polls-container');
  pollsContainer.innerHTML = ''; // Clear existing poll

  if (index >= polls.length) {
    // All polls have been shown
    return;
  }

  const poll = polls[index];
  const pollElement = createPollElement(poll, poll.id);

  pollsContainer.appendChild(pollElement);

  // Handle voting animation and display the next poll
  pollElement.querySelectorAll('.option').forEach((optionElement, optionIndex) => {
    optionElement.addEventListener('click', () => {
      setTimeout(() => {
        pollElement.classList.add('fly-up'); // Add fly up animation class
        setTimeout(() => {
          displaySinglePoll(polls, index + 1); // Display next poll
        }, 500); // Match this duration with the fly up animation duration
      }, 400); // Delay to allow the voting action to complete
    });
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

  // Increment the vote count for the selected option
  poll.options[optionIndex].votes++;

  // Update database with new vote count
  database.ref(`polls/${pollId}/options/${optionIndex}/votes`).set(poll.options[optionIndex].votes);

  // Update UI for all options in the same poll
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  const optionsContainer = optionElement.parentElement;
  poll.options.forEach((option, index) => {
    const optionElement = optionsContainer.children[index];
    const voteBar = optionElement.querySelector('.vote-bar');
    voteBar.style.width = totalVotes > 0 ? `${(option.votes / totalVotes) * 100}%` : '0%';
    const optionVotesElement = optionElement.querySelector('.option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;
  });

  // Disable the option to prevent multiple votes
  localStorage.setItem(userVoteKey, optionIndex);
  optionElement.classList.add('disabled');
  const pollElement = optionElement.closest('.poll');
  pollElement.classList.add('disabled-poll');

  setTimeout(() => {
    const pollsContainer = document.getElementById('polls-container');
    pollsContainer.appendChild(pollElement);
  }, 600);
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
};*/




























































































document.addEventListener('contextmenu', event => event.preventDefault());

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAaYarZ9GRra00k3-bZ3iYq7Z29JKBGlQ",
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
  const userName = localStorage.getItem('name');

  database.ref('polls').once('value', (snapshot) => {
    const polls = [];
    snapshot.forEach((childSnapshot) => {
      const poll = childSnapshot.val();
      poll.id = childSnapshot.key;

      // Check if the user has voted on this poll
      const userVoteKey = `poll-${poll.id}-${userName}-option`;
      if (!localStorage.getItem(userVoteKey)) {
        polls.push(poll);
      }
    });

    // Shuffle polls to display in random order
    for (let i = polls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [polls[i], polls[j]] = [polls[j], polls[i]];
    }

    // Display the first poll
    if (polls.length > 0) {
      displaySinglePoll(polls, 0);
    }
  });
}

function displaySinglePoll(polls, index) {
  const pollsContainer = document.getElementById('polls-container');
  pollsContainer.innerHTML = ''; // Clear existing poll

  if (index >= polls.length) {
    // All polls have been shown
    return;
  }

  const poll = polls[index];
  const pollElement = createPollElement(poll, poll.id, polls, index);

  pollsContainer.appendChild(pollElement);

  // Handle voting animation and display the next poll
  pollElement.querySelectorAll('.option').forEach((optionElement, optionIndex) => {
    optionElement.addEventListener('click', () => {
      setTimeout(() => {
        pollElement.classList.add('fly-up'); // Add fly up animation class
        setTimeout(() => {
          displaySinglePoll(polls, index + 1); // Display next poll
        }, 500); // Match this duration with the fly up animation duration
      }, 400); // Delay to allow the voting action to complete
    });
  });
}

function createPollElement(poll, pollId, polls, index) {
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

  // Create skip button
  const skipButton = document.createElement('button');
  skipButton.textContent = 'Skip';
  skipButton.classList.add('skip-button');
  skipButton.addEventListener('click', () => {
    // Move the current poll to the end of the polls array
    const updatedPolls = [...polls.slice(0, index), ...polls.slice(index + 1), poll];
    displaySinglePoll(updatedPolls, index);
  });

  pollElement.append(optionsContainer, skipButton);

  return pollElement;
}

function voteOnOption(pollId, optionIndex, optionElement, poll) {
  const userName = localStorage.getItem('name');
  const userVoteKey = `poll-${pollId}-${userName}-option`;

  // Increment the vote count for the selected option
  poll.options[optionIndex].votes++;

  // Update database with new vote count
  database.ref(`polls/${pollId}/options/${optionIndex}/votes`).set(poll.options[optionIndex].votes);

  // Update UI for all options in the same poll
  const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);
  const optionsContainer = optionElement.parentElement;
  poll.options.forEach((option, index) => {
    const optionElement = optionsContainer.children[index];
    const voteBar = optionElement.querySelector('.vote-bar');
    voteBar.style.width = totalVotes > 0 ? `${(option.votes / totalVotes) * 100}%` : '0%';
    const optionVotesElement = optionElement.querySelector('.option-votes');
    optionVotesElement.textContent = `${option.votes} Votes`;
  });

  // Disable the option to prevent multiple votes
  localStorage.setItem(userVoteKey, optionIndex);
  optionElement.classList.add('disabled');
  const pollElement = optionElement.closest('.poll');
  pollElement.classList.add('disabled-poll');

  setTimeout(() => {
    const pollsContainer = document.getElementById('polls-container');
    pollsContainer.appendChild(pollElement);
  }, 600);
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
