document.addEventListener("DOMContentLoaded", function() {
  document.style.zoom = "90%";
  // Get the close button and advertisement elements
  var closeBtn = document.getElementById("closeBtn");
  var advertisement = document.getElementById("advertisement");
  var progressBar = document.getElementById("progressBar");

  // Close the advertisement when close button is clicked
  closeBtn.addEventListener("click", function() {
      advertisement.style.display = "none";
  });

  // Automatically close the advertisement after 5 seconds
  setTimeout(function() {
      advertisement.style.display = "none";
  }, 10000);

  // Update the progress bar
  var width = 1;
  var interval = setInterval(function() {
      if (width >= 100) {
          clearInterval(interval);
      } else {
          width++;
          progressBar.style.width = width + "%";
      }
  }, 46); // Adjust the speed of the progress bar here
}); 

document.addEventListener("DOMContentLoaded", function() {
  // Get the close button and advertisement elements
  var closeBtn = document.getElementById("closeBtn");
  var advertisement = document.getElementById("advertisement");
  var progressBar = document.getElementById("progressBar");

  // Close the advertisement when close button is clicked
  closeBtn.addEventListener("click", function() {
      advertisement.style.display = "none";
  });

  // Automatically close the advertisement after 5 seconds
  setTimeout(function() {
      advertisement.style.display = "none";
  }, 10000);

  // Update the progress bar
  var width = 1;
  var interval = setInterval(function() {
      if (width >= 100) {
          clearInterval(interval);
      } else {
          width++;
          progressBar.style.width = width + "%";
      }
  }, 46); // Adjust the speed of the progress bar here
}); 



document.addEventListener('contextmenu',
event => event.preventDefault());
// We enclose this in window.onload.
// So we don't have ridiculous errors.
window.onload = function() {

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAaYarZ9GRra00k3-bZ3i3Yq7Z29JKBGlQ",
    authDomain: "chat-f6c20.firebaseapp.com",
    projectId: "chat-f6c20",
    storageBucket: "chat-f6c20.appspot.com",
    messagingSenderId: "589761348145",
    appId: "1:589761348145:web:3e23e78556f53704198b10"
  };
  

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
     
    // This is very IMPORTANT!! We're going to use "db" a lot.
    var db = firebase.database()
    // We're going to use oBjEcT OrIeNtEd PrOgRaMmInG. Lol
    class MEME_CHAT{

      constructor() {
        this.lastMessageTime = {};
        this.bannedUsers = JSON.parse(localStorage.getItem('bannedUsers')) || {};
      }

      delete_all_messages() {
        var parent = this;
        // Get the firebase database reference to the "chats" node
        var chatsRef = db.ref('chats/');
  
        // Remove all messages from the database
        chatsRef.remove()
          .then(() => {
            // After removing the entire "chats" node, add a custom message
            parent.add_custom_message();
          })
          .catch((error) => {
            console.error("Error removing messages: ", error);
          });
      }
      add_custom_message() {
        var parent = this;
      
        // Create a new timestamp for the message
        var timestamp = Date.now();
      
        // Get the Firebase database reference
        var chatsRef = db.ref('chats/');
      
        // Get the number of existing messages to determine the index
        chatsRef.once('value', function(message_object) {
          var index = parseFloat(message_object.numChildren()) + 1;
      
          // Set the custom message data in the database
          var customMessageData = {
            name: "ZNet",
            message: "To keep the chat experience smooth and responsive for everyone, we periodically delete old messages once the chat reaches a certain limit. This helps us manage the chat efficiently and ensures that the ZNet runs optimally. All previous messages have been deleted. Feel free to continue the conversation!",
            timestamp: timestamp,
            index: index,
            sender: "ZNet_System",
          };
      
          // Push the custom message data to the database
          chatsRef.child(`message_${index}`).set(customMessageData)
            .then(function() {
              // After we send the chat, refresh to get the new messages
              parent.refresh_chat();
            })
            .catch(function(error) {
              console.error("Error adding custom message: ", error);
            });
        });
      }
      
      
    
    
      banUser(userId) {
        return new Promise((resolve, reject) => {
          // Store the banned user and the ban timestamp in the Firebase database and localStorage
          this.bannedUsers[userId] = Date.now();
          localStorage.setItem('bannedUsers', JSON.stringify(this.bannedUsers));
          db.ref('banned_users/' + userId).set({
            timestamp: Date.now()
          })
          .then(() => {
            // Trigger a page reload for the banned user
            db.ref('banned_users/' + userId).once('value', (snapshot) => {
              if (snapshot.exists()) {
                window.location.reload();
              }
              resolve();
            });
          })
          .catch((error) => {
            reject(error);
          });
        });
      }
    
      canAccessChat(userId) {
        return new Promise((resolve, reject) => {
          // Check if the user is banned in the Firebase database and localStorage
          const banTimestamp = this.bannedUsers[userId] || null;
          db.ref('banned_users/' + userId).once('value')
            .then((bannedUserSnapshot) => {
              const bannedUser = bannedUserSnapshot.val();
      
              // Set up a listener on the "banned_users" node
              db.ref('banned_users/' + userId).on('value', (snapshot) => {
                if (snapshot.exists()) {
                  // User has been banned, reload the page
                  window.location.reload();
                }
              });
      
              if ((banTimestamp && Date.now() - banTimestamp < 100) || (bannedUser && Date.now() - bannedUser.timestamp < 1800000)) {
                // User is banned, prevent access
                resolve(false);
              } else {
                // User is not banned, allow access
                resolve(true);
              }
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    
      handleNewMessage(username, message) {
        // Get the current time
        const currentTime = Date.now();
    
        // Check if the user has sent a message recently
        if (this.lastMessageTime[username] && currentTime - this.lastMessageTime[username] < 10000) {
          // If the user has sent a message within the last 10 seconds, don't allow the new message
          console.log(`${username} is sending messages too quickly, please wait 10 seconds before sending another message.`);
          return;
        }
    
        // If the user is allowed to send the message, update the last message time
        this.lastMessageTime[username] = currentTime;

        // Check for profanity
        if (this.hasProfanity(message)) {
          // Log the user out
          this.logoutUser(username);
          return;
        }

          // Check for spam
         if (this.isSpamming(username, message, 10000)) { // 10 seconds threshold
          // Log the user out
          this.logoutUser(username);
          return;
        }
    
        // Process the new message
        this.send_message(message);
      }
    
      updateTypingIndicator(username, isTyping) {
        // Find the typing indicator element for the given username
        var typingIndicator = document.getElementById(`typing-indicator-${username}`);
        if (isTyping) {
          // Show the typing indicator
          if (!typingIndicator) {
            // Create a new typing indicator element
            typingIndicator = document.createElement('div');
            typingIndicator.setAttribute('id', `typing-indicator-${username}`);
            typingIndicator.textContent = `${username} is typing...`;
            // Append the typing indicator to the chat content container
            chat_content_container.appendChild(typingIndicator);
          }
        } else {
          // Hide the typing indicator
          if (typingIndicator) {
            typingIndicator.remove();
          }
        }
      }

      /*delete_all_messages() {
        // Get the firebase database reference to the "chats" node
        var chatsRef = db.ref('chats/');
    
        // Remove all messages from the database
        chatsRef.remove()
          .then(() => {
            // After removing the entire "chats" node, recreate it to keep the structure
            chatsRef.set({});
    
            // After successful deletion, refresh the chat to update the UI
            this.refresh_chat();
          })
          .catch((error) => {
            console.error("Error removing messages: ", error);
          });
      }*/
      // Home() is used to create the home page
      home(){
        // First clear the body before adding in
        // a title and the join form
        document.body.innerHTML = ''
        this.create_title()
        this.create_join_form()
      }
      // chat() is used to create the chat page
      chat(){
        this.create_title()
        this.create_chat()
      }
      // create_title() is used to create the title
      create_title(){
        // This is the title creator. 🎉
        var title_container = document.createElement('div')
        title_container.setAttribute('id', 'title_container')
        title_container.style.height = '10%';
        title_container.style.minHeight = '60px';
        //title_container.style.background = 'linear-gradient(to right, #0000000f, #00000048, #000000, #00000048, #0000000f)';

        var title_inner_container = document.createElement('div')
        title_inner_container.setAttribute('id', 'title_inner_container')
  
        var title = document.createElement('h1')
        title.setAttribute('id', 'title')
        title.textContent = 'ZNet'
        title.style.fontSize = '35px'

        title_inner_container.append(title)
        title_container.append(title_inner_container)
        document.body.append(title_container)
      }
      // create_join_form() creates the join form
      create_join_form() {
        var parent = this;
      
        var join_container = document.createElement('div');
        join_container.setAttribute('id', 'join_container');
        var join_inner_container = document.createElement('div');
        join_inner_container.setAttribute('id', 'join_inner_container');
        join_inner_container.classList.add('disabled');
      
        var join_button_container = document.createElement('div');
        join_button_container.setAttribute('id', 'join_button_container');
      
        var join_button = document.createElement('button');
        join_button.setAttribute('id', 'join_button');
        join_button.innerHTML = 'Enter';
        join_button.classList.add('disabled'); // Start with button disabled
      
        join_button.addEventListener('click', function() {
          var userName = document.getElementById('join_input').value;
          var userClass = document.getElementById('dropdown').value;
          if (userName.trim() !== '' && userClass !== '') {
            // Save the user's name and class to localStorage
            app.save_name(userName);
            localStorage.setItem('class', userClass);
      
            // Add the user to the 'users' node in the Firebase Realtime Database
            db.ref('users/' + userName).set({
              name: userName,
              class: userClass,
              timestamp: Date.now()
            })
            .then(function() {
              // Redirect the user to the chat page
              app.chat();
            })
            .catch(function(error) {
              console.error('Error adding user to the database:', error);
            });
          }
        });
      
        var join_label = document.createElement('h1');
        join_label.setAttribute('id', 'join_label');
        join_label.textContent = 'Login';
        join_label.classList.add('disabled');
      
        // Create and style an <h3> element for the name label
        var nameLabel = document.createElement('h3');
        nameLabel.textContent = 'Name:';
        nameLabel.classList.add('label-style'); // Add your CSS class here
      
        var join_input_container = document.createElement('div');
        join_input_container.setAttribute('id', 'join_input_container');
      
        var join_input = document.createElement('input');
        join_input.setAttribute('id', 'join_input');
        join_input.setAttribute('maxlength', 10);
        join_input.placeholder = 'Your name';
      
        var password_input_container = document.createElement('div');
        password_input_container.setAttribute('id', 'password_input_container');
      
        // Create and style an <h3> element for the password label
        var passwordLabel = document.createElement('h3');
        passwordLabel.textContent = 'Password:';
        passwordLabel.classList.add('label-style'); // Add your CSS class here
      
        var password_input = document.createElement('input');
        password_input.setAttribute('id', 'password_input');
        password_input.setAttribute('type', 'password');
        password_input.setAttribute('maxlength', 20);
        password_input.placeholder = 'Password';
      
        // Create a dropdown (select) element
        var dropdown_container = document.createElement('div');
        dropdown_container.setAttribute('id', 'dropdown_container');
      
        var dropdown = document.createElement('select');
        dropdown.setAttribute('id', 'dropdown');

        // Create placeholder option
        var placeholder_option = document.createElement('option');
        placeholder_option.value = '';
        placeholder_option.textContent = 'Your Class';
        placeholder_option.style.color = '#8b8b8b';
        placeholder_option.disabled = true;
        placeholder_option.selected = true;
        dropdown.appendChild(placeholder_option);
        
        // Create option elements
        var options = ['2-1', '2-2', '2-3', '2-4','2-5', '2-6', '2-7', '2-8', '2-9'];
        options.forEach(function(optionText) {
          var option = document.createElement('option');
          option.value = optionText;
          option.textContent = optionText;
          dropdown.appendChild(option);
        });
      
        /*// Function to check if both inputs are valid and enable/disable the button
        function checkInputs() {
          if (
            join_input.value.length > 4 &&
            password_input.value === '1class1voice' &&
            dropdown.value !== ''
          ) {
            join_button.classList.add('enabled');
            join_label.classList.add('color_enabled');
            join_inner_container.classList.add('border_enabled');
            join_button.onclick = function () {
              parent.save_name(join_input.value);
              //join_container.remove();
              //parent.create_chat();
              window.location.reload();
            };
          } else {
            join_button.classList.remove('enabled');
            join_label.classList.remove('color-enabled');
            join_inner_container.classList.remove('border-enabled');
            join_button.onclick = null;
          } 
        }*/

        async function userExists(username) {
          try {
            let snapshot = await db.ref('users/' + username).once('value');
            return snapshot.exists();
          } catch (error) {
            console.error('Error checking if user exists:', error);
            return false;
          }
        }

        let alertShown = false; // Flag to track if the alert has been shown

        async function checkInputs() {
          let username = join_input.value.trim();
          let password = password_input.value;
          let userClass = dropdown.value;
          
          if (username.length > 4 && password === '1class1voice' && userClass !== '' && !(await userExists(username))) {
            join_button.classList.add('enabled');
            join_label.classList.add('color_enabled');
            join_inner_container.classList.add('border_enabled');
            join_button.onclick = async function () {
              app.save_name(username);
              localStorage.setItem('class', userClass);
              window.location.reload();
        
              try {
                await db.ref('users/' + username).set({
                  name: username,
                  class: userClass,
                  timestamp: Date.now()
                });
                app.chat();
              } catch (error) {
                console.error('Error adding user to the database:', error);
              }
            };
            alertShown = false; // Reset alert flag when input is valid
          } else {
            join_button.classList.remove('enabled');
            join_label.classList.remove('color_enabled');
            join_inner_container.classList.remove('border_enabled');
            join_button.onclick = null;
        
            if (username.length > 0 && await userExists(username) && !alertShown) {
              alert('Oops! Looks like this user is already logged in! Please enter a different name!');
              alertShown = true; // Set alert flag when alert is shown
            } else if (username.length === 0) {
              alertShown = false; // Reset alert flag when input is empty
            }
          }
        }
                
      
        // Attach event listeners for input changes
        join_input.onkeyup = checkInputs;
        password_input.onkeyup = checkInputs;
        dropdown.onchange = checkInputs;
      
        // Append everything to the body
        join_button_container.append(join_button);
        join_input_container.append(join_input);
        password_input_container.append(password_input);
        dropdown_container.append(dropdown);
        join_inner_container.append(join_label, join_input_container, password_input_container, dropdown_container, join_button_container);
        join_container.append(join_inner_container);
        document.body.append(join_container);
      }
      
      
      // create_load() creates a loading circle that is used in the chat container
      create_load(container_id){
        // YOU ALSO MUST HAVE (PARENT = THIS). BUT IT'S WHATEVER THO.
        var parent = this;
  
        // This is a loading function. Something cool to have.
        var container = document.getElementById(container_id)
        container.innerHTML = ''
  
        var loader_container = document.createElement('div')
        loader_container.setAttribute('class', 'loader_container')
  
        var loader = document.createElement('div')
        loader.setAttribute('class', 'loader')
  
        loader_container.append(loader)
        container.append(loader_container)
  
      }
      // create_chat() creates the chat container and stuff
      async create_chat(){
        // Again! You need to have (parent = this)
        var parent = this;

    // Check if the user is banned before allowing access to the chat
    if (!(await this.canAccessChat(this.get_name()))) {
      // User is banned, display a message or redirect to a different page
      alert("You have been banned by an admin, please come back in 30 minutes.");
      return;
    }

// Get the Firebase database reference
var chatsRef = db.ref('chats/');

// Keep track of the total number of messages
var totalNumMessages = 0;

// Keep track of the number of messages when the user was last on the page
var numMessagesOnPageFocus = 0;

// Flag to indicate if the user is currently on the page
var onPage = true;

// Function to update the badge notification
function updateBadgeNotification(numUnreadMessages) {
  if (onPage || numUnreadMessages === 0) {
    document.title = `ZNet`;
  } else {
    var messageWord = numUnreadMessages === 1 ? 'Message' : 'Messages';
    document.title = `(${numUnreadMessages}) Unread ${messageWord} | ZNet`;
  }
}

// Listen for changes in the "chats" node
chatsRef.on('value', function(snapshot) {
  // Get the current number of messages
  var numMessages = snapshot.numChildren();

  // Calculate the number of unread messages
  var numUnreadMessages = onPage ? 0 : Math.max(0, numMessages - numMessagesOnPageFocus);

  // Update the badge notification
  updateBadgeNotification(numUnreadMessages);

  // Update the total number of messages
  totalNumMessages = numMessages;
});

// Event listener for when the page gains focus
window.addEventListener('focus', function() {
  onPage = true;
  updateBadgeNotification(0);
  numMessagesOnPageFocus = totalNumMessages;
});

// Event listener for when the page loses focus
window.addEventListener('blur', function() {
  onPage = false;
});

// Initialize numMessagesOnPageFocus to 0 when the page initially loads
numMessagesOnPageFocus = 0;

      // Get the Firebase database reference
      var chatsRef = db.ref('chats/');

      // Keep track of the total number of messages
      var totalNumMessages = 0;

      // Listen for changes in the "chats" node
      chatsRef.on('value', function(snapshot) {
        // Get the current number of messages
        var numMessages = snapshot.numChildren();

        // Update the total number of messages
        totalNumMessages = numMessages;

        // Check if the total number of messages has reached 50
        if (totalNumMessages >= 50) {
          // Delete all messages if the count reaches 50
          parent.delete_all_messages();
        }
      });



        var banButton = document.createElement('button');
        banButton.setAttribute('id', 'ban_button');
        banButton.innerHTML = '<i class="fa-solid fa-user-slash"></i>';
        banButton.style.right = '20px';
        banButton.style.top = '2.5%';
        banButton.style.width = '50px';
        banButton.style.height = '50px';
        banButton.style.fontSize = '16px';
        banButton.style.zIndex = '120';
        //banButton.style.transform = 'translate(-50%, -50%)';
        banButton.style.position = 'absolute';
        banButton.style.color = '#ffffff';
        banButton.style.background = '#000000';
        //banButton.style.border = '1px solid #ffffff';
        banButton.style.borderRadius = '10px';
        banButton.style.transition = '0.6s ease';
        banButton.style.display = 'none';

        banButton.addEventListener('click', () => {
          // Get the username of the user to be banned
          const userToBan = prompt('Enter the username of the user to ban:');
          if (userToBan) {
            // Ban the user
            this.banUser(userToBan);
            alert(`User ${userToBan} has been banned for 30 minutes.`);
          }
        });

          // Function to create the profile circle
  function createProfileCircle(name) {
    var profileCircle = document.createElement('div');
    profileCircle.setAttribute('class', 'profile-circle');

    // Generate a unique background colour for the profile circle based on the user's name
    var hue = (name.charCodeAt(0) * 137.508) % 100; // Use the character code of the first letter for better distribution
    hue = hue + 200; // Shift hue towards the blue-purple range
    profileCircle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`; // Keep saturation and lightness constant

    profileCircle.textContent = name.charAt(0).toUpperCase();
    return profileCircle;
  } 
  // Create the participants button
  var participantsButton = document.getElementById('users');
  var participantsButtonText = participantsButton.querySelector('.text');
  //participantsButton.classList.add('.users');
  //participantsButton.innerHTML = '0 Members';
  //participantsButton.style.right = '100px';
  //participantsButton.style.bottom = 'calc(100vh - 75px)';
  //participantsButton.style.width = '50px';
  //participantsButton.style.height = '50px';
  //participantsButton.style.fontSize = '16px';
  //participantsButton.style.position = 'fixed';
  //participantsButton.style.color = '#ffffff';
  //participantsButton.style.background = '#000000';
  //participantsButton.style.borderRadius = '10px';
  //participantsButton.style.transition = '0.6s ease';
  //participantsButton.style.zIndex = '9998';
  //participantsButton.style.display = 'none';
  // Create the participants popup
  var participantsPopup = document.createElement('div');
  participantsPopup.setAttribute('id', 'participants_popup');
  participantsPopup.style.position = 'fixed';
  participantsPopup.style.top = '50%';
  participantsPopup.style.left = '50%';
  participantsPopup.style.transform = 'translate(-50%, -50%)';
  participantsPopup.style.width = '675px';
  participantsPopup.style.height = '450px';
  participantsPopup.style.backgroundColor = '#ffffff';
  participantsPopup.style.padding = '0 20px 0 20px';
  participantsPopup.style.borderRadius = '15px';
  //participantsPopup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  participantsPopup.style.zIndex = '6000';
  participantsPopup.style.display = 'none';
  participantsPopup.style.overflowY = 'scroll';
  participantsPopup.style.overflowX = 'hidden';
  participantsPopup.style.fontFamily = 'Varela Round';

  var participantsTitle = document.createElement('h2');
  //participantsTitle.textContent = 'Members';
  participantsTitle.style.fontSize = '18px';
  participantsTitle.style.padding = '25px 0 20px 25px';
  participantsTitle.style.borderBottom = '2px solid #b8b8b8';
  participantsTitle.style.width = 'calc(100% + 40px)';
  participantsTitle.style.marginLeft = '-20px';
  participantsTitle.style.position = 'sticky';
  participantsTitle.style.top = '0';
  //participantsTitle.style.marginTop = '-50px';
  participantsTitle.style.zIndex = '10';
  participantsTitle.style.background = '#ffffff';
  participantsTitle.style.display = 'block';

  var participantsLine = document.createElement('hr');

  var participantsList = document.createElement('ul');
  participantsList.style.listStyleType = 'none';
  participantsList.style.padding = '20px 0 10px 0';


  participantsPopup.append(participantsTitle, participantsLine, participantsList);

  // Add event listener to the participants button
  participantsButton.addEventListener('click', () => {
    if (participantsPopup.style.display === 'none') {
      participantsPopup.style.display = 'block';
      participantsPopup.style.zIndex = '9999';
      overlay.style.display = 'block';
      overlay.style.zIndex = '9000';
    } else {
      participantsPopup.style.display = 'none';
      overlay.style.display = 'none';
      participantsPopup.style.zIndex = '';
      overlay.style.zIndex = '';
    }
  });

  var pOverlay = document.getElementById('overlay');
  pOverlay.addEventListener('click', () => {
    participantsPopup.style.display = 'none';
    participantsPopup.style.zIndex = '1';
    pOverlay.style.display = 'none';
    pOverlay.style.zIndex = '1';
  });

  // Set up a real-time listener on the "users" node
// Set up a real-time listener on the "users" node
db.ref('users').on('value', (snapshot) => {
  const usersData = snapshot.val();
  const users = Object.keys(usersData);

  // Sort users by class
  users.sort((userKey1, userKey2) => {
      const userClass1 = usersData[userKey1].class;
      const userClass2 = usersData[userKey2].class;

      // Example sorting logic: Sort by class in ascending order
      return userClass1.localeCompare(userClass2);
  });

  const numParticipants = users.length;

  // Update the participants button text
  participantsButtonText.innerHTML = `Members | ${numParticipants}`;
  participantsTitle.innerHTML = `${numParticipants} Members`;

  // Update the participants list
  participantsList.innerHTML = '';
  participantsList.style.zIndex = '5';

  users.forEach((userKey) => {
      const userData = usersData[userKey];
      const listItem = document.createElement('li');
      listItem.style.display = 'flex';
      listItem.style.alignItems = 'center';
      listItem.style.marginBottom = '10px';
      listItem.style.fontSize = '14px';

      const profileCircle = createProfileCircle(userKey);
      listItem.appendChild(profileCircle);

      const userName = document.createElement('span');
      userName.textContent = userData.name; // Assuming the user object has a 'name' attribute
      userName.classList.add('user-name');
      listItem.appendChild(userName);

      const userClass = document.createElement('span');
      userClass.textContent = userData.class; // Assuming the user object has a 'class' attribute
      userClass.classList.add('user-class');
      listItem.appendChild(userClass);

      participantsList.appendChild(listItem);
  });
});



  var style = document.createElement('style');
  style.innerHTML = `
    .profile-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #000;
      color: #fff;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      margin-right: 10px;
    }
  `;
  document.head.appendChild(style);

        // GET THAT MEMECHAT HEADER OUTTA HERE
        var title_container = document.getElementById('title_container')
        var title = document.getElementById('title')
        title_container.classList.add('chat_title_container')
        // Make the title smaller by making it 'chat_title'
        title.classList.add('chat_title')
  
        var chat_container = document.createElement('div')
        chat_container.setAttribute('id', 'chat_container')
  
        var chat_inner_container = document.createElement('div')
        chat_inner_container.setAttribute('id', 'chat_inner_container')
  
        var chat_content_container = document.createElement('div')
        chat_content_container.setAttribute('id', 'chat_content_container')
        chat_content_container.style.marginTop = '10vh';
        chat_content_container.style.height = '90vh';
        chat_content_container.style.paddingTop = '30px';

        var chat_input_container = document.createElement('div')
        chat_input_container.setAttribute('id', 'chat_input_container')

        var chat_settings = document.createElement('button')
        chat_settings.setAttribute('id', 'chat_settings')
        chat_settings.innerHTML = `<i class="fa-solid fa-sliders"></i>`
        chat_settings.style.display = 'none';

        var sidebar_icon = document.getElementById('sidebar-icon')

        var sidebar = document.getElementById('sidebar');
        function toggleSidebar() {
          if (chat_content_container.style.width === '100%') {
            //expand the sidebar
            chat_content_container.style.width = '84%';
            chat_content_container.style.top = '0';
            chat_content_container.style.right = '0';
            chat_content_container.style.marginLeft = '16%';
            chat_content_container.style.zIndex = '9999';
            sidebar.style.marginLeft = '0';
            sidebar.style.zIndex = '5000';
            chat_input_container.style.width = '84%';
            chat_input_container.style.marginLeft = '16%';
            title_container.style.width = '84%';
            title_container.style.marginLeft = '16%';
            sidebar_icon.style.left = 'calc(16% - 60px)';
            sidebar_icon.style.top = '10px';
          } else {
            //collapse the sidebar
            chat_content_container.style.width = '100%';
            chat_content_container.style.marginLeft = '0';
            chat_content_container.style.zIndex = '9999';
            chat_content_container.style.transition = '0.4s ease';
            sidebar.style.marginLeft = '-16%';
            sidebar.style.zIndex = '5000';
            sidebar.style.transition = '0.4s ease';
            chat_input_container.style.width = '100%';
            chat_input_container.style.marginLeft = '0';
            chat_input_container.style.transition = '0.4s ease';
            title_container.style.width = '100%';
            title_container.style.marginLeft = '0';
            title_container.style.transition = '0.4s ease';
            sidebar_icon.style.left = '10px';
            sidebar_icon.style.top = '10px';
            sidebar_icon.style.transition = '0.4s ease';
          }
        }
        sidebar_icon.addEventListener('click', toggleSidebar);

        /*sidebar.addEventListener('mouseenter', function() {
          sidebarIconTimeout = setTimeout(function() {
            sidebar_icon.style.display = 'block';
          }, 100);

          sidebar.style.width = '16%';
          sidebar.style.transition = '0.3s ease';
          sidebar.style.opacity = '1';
          sidebar.style.left = '0';
          sidebar.style.paddingLeft = '14px';
          sidebar.style.paddingRight = '17px';
          title_container.style.width = '84%';
          title_container.style.marginLeft = '16%';
          title_container.style.transition = '0.3s ease';
          chat_content_container.style.width = '84%';
          chat_content_container.style.marginLeft = '16%';
          chat_content_container.style.transition = '0.3s ease';
          chat_input_container.style.width = '84%';
          chat_input_container.style.marginLeft = '16%';
          chat_input_container.style.transition = '0.3s ease';

          spotify.style.width = '84%';
          spotify.style.transition = '0.3s ease';

          participantsPopup.style.transition = '0.3s ease';

          chat_logout_container.style.width = '84%';
          chat_logout_container.style.marginLeft = '16%';
          chat_logout_container.style.transition = '0.3s ease';

          chatSettings.style.zIndex = '9999';
          chatSettings.style.right = '95px';
          chatSettings.style.transition = '0.3s ease';
          chatSettings.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
          participantsButton.style.right = '152px';
          banButton.style.right = '207px';
        });
        
        sidebar.addEventListener('mouseleave', function() {
          clearTimeout(sidebarIconTimeout); // Clear the timeout if mouse leaves before the delay
          sidebar_icon.style.display = 'none';

          sidebar.style.width = '78px';
          sidebar.style.transition = '0.3s ease';
          sidebar.style.opacity = '1';
          sidebar.style.left = '0';
          sidebar.style.paddingLeft = '14px';
          sidebar.style.paddingRight = '17px';
          //sidebar.style.boxShadow = '0 0 4px #00000023';
          title_container.style.width = 'calc(100% - 74px)';
          title_container.style.marginLeft = '74px';
          title_container.style.transition = '0.3s ease';
          chat_content_container.style.width = 'calc(100% - 74px)';
          chat_content_container.style.marginLeft = '74px';
          chat_input_container.style.width = 'calc(100% - 74px)';
          chat_input_container.style.marginLeft = '74px';

          spotify.style.width = 'calc(100% - 78px)';

          chat_logout_container.style.width = 'calc(100% - 74px)';
          chat_logout_container.style.marginLeft = '74px';

          chatSettings.style.zIndex = '9999';
          chatSettings.style.left = '25px';
          chatSettings.style.transition = '0.3s ease';
          chatSettings.innerHTML = `<i class="fa-solid fa-sliders"></i>`;
          banButton.style.right = '155px';
          participantsButton.style.right = '100px';
        });*/

        var profileCircle = document.getElementById('profile-circle');
        var profileLetter = document.getElementById('profile-letter');
        var profileName = document.getElementById('profile-name');

        profileCircle.style.background = '#000';
        profileCircle.style.width = '50px';
        profileCircle.style.height = '50px';
        profileCircle.style.borderRadius = '50%';
        profileCircle.style.color = '#fff';
        profileCircle.style.fontSize = '20px';
        profileCircle.style.fontWeight = '900';
        profileCircle.style.alignItems = 'center';
        profileCircle.style.justifyContent = 'center';
        profileCircle.style.display = 'flex';
        profileLetter.textContent = `${parent.get_name()}`.charAt(0).toUpperCase();
        // Generate a unique background colour for the profile circle based on the user's name
        var hue = (parent.get_name().charCodeAt(0) * 137.508) % 100; // Use the character code of the first letter for better distribution
        hue = hue + 200; // Shift hue towards the blue-purple range
        profileCircle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`; // Keep saturation and lightness constant


        profileName.style.color = '#000';
        profileName.style.fontSize = '15px';
        profileName.style.fontWeight = '600';
        profileName.textContent = `${parent.get_name()}`;


        var poll = document.getElementById('poll');
        var polls = document.getElementById('polls');
        var isPoll = true;

        poll.addEventListener('click', function() {
            polls.style.display = 'block';
            poll.style.background = '#565656';
            poll.style.paddingLeft = '16px';
            chat_input_container.style.display = 'none';
            isPoll = false;
            sidebar_icon.style.display = 'none';
        });

        var removePollsButton = document.getElementById('remove-polls');
        removePollsButton.addEventListener('click', function() {
          polls.style.display = 'none';
          poll.style.background = '';
          poll.style.paddingLeft = '';
          chat_input_container.style.display = '';
          isPoll = true;
          sidebar_icon.style.display = 'block';
        });

        document.getElementById('meet').addEventListener('click', function() {
          // Navigate to games.html in the same tab
          window.location.href = './Games/games.html';
        });
        /*
        var game = document.getElementById('meet');
        var games = document.getElementById('games');
        var isGame = true;

        game.addEventListener('click', function() {
          if (isGame) {
            games.style.display = 'block';
            game.style.background = '#565656';
            game.style.paddingLeft = '16px';
            chat_input_container.style.display = 'none';
            isGame = false;
            sidebar_icon.style.display = 'none';
          } else {
            games.style.display = 'none';
            game.style.background = '';
            game.style.paddingLeft = '';
            chat_input_container.style.display = '';
            isGame = true;
            sidebar_icon.style.display = 'block';
          };
        });*/

        var overlay = document.getElementById('overlay');
        var spotify = document.getElementById('spotify');
        var music = document.getElementById('music');
        var isMusic = true;

        music.addEventListener('click', function() {
          if (isMusic) {
            if (forms.style.display === 'block') {
              spotify.style.display = 'none';
              //chat_input.style.display = 'none';
              //chat_input_send.style.display = 'none';
              //overlay.style.display = 'block';
            } else {
              spotify.style.display = 'none';
              //overlay.style.display = 'block';
              //chat_input.style.display = 'none';
              //chat_input_send.style.display = 'none';
              isMusic = false; // Update the state
            };
          } else {
            spotify.style.display = 'none';
            overlay.style.display = 'none';
            sidebar.style.marginRight = '0px';
            chat_settings.style.marginRight = '0';
            chat_input.style.display = 'block';
            chat_input_send.style.display = 'block';
            isMusic = true;
          }
        });

        // Get all playlist divs
        var playlists = document.getElementsByClassName('spotify')[0].getElementsByClassName('playlist');

        // Get all buttons
        var btnPlaylist1 = document.getElementById('btn_playlist_1');
        var btnPlaylist2 = document.getElementById('btn_playlist_2');
        var btnPlaylist3 = document.getElementById('btn_playlist_3');

        // Add click event listeners to the buttons
        btnPlaylist1.addEventListener('click', function() {
          document.getElementById('playlist_1').style.display = 'block';
          document.getElementById('playlist_2').style.display = 'none';
          document.getElementById('playlist_3').style.display = 'none';

          btnPlaylist1.style.fontWeight = '700';
          btnPlaylist2.style.fontWeight = '100';
          btnPlaylist3.style.fontWeight = '100';
        });

        btnPlaylist2.addEventListener('click', function() {
          document.getElementById('playlist_2').style.display = 'block';
          document.getElementById('playlist_1').style.display = 'none';
          document.getElementById('playlist_3').style.display = 'none';

          btnPlaylist2.style.fontWeight = '700';
          btnPlaylist1.style.fontWeight = '100';
          btnPlaylist3.style.fontWeight = '100';
        });

        btnPlaylist3.addEventListener('click', function() {
          document.getElementById('playlist_3').style.display = 'block';
          document.getElementById('playlist_2').style.display = 'none';
          document.getElementById('playlist_1').style.display = 'none';

          btnPlaylist3.style.fontWeight = '700';
          btnPlaylist2.style.fontWeight = '100';
          btnPlaylist1.style.fontWeight = '100';
        });

        var forms = document.getElementById('forms');
        var feedback = document.getElementById('feedback');
        var isFeedback = true;

        feedback.addEventListener('click', function() {
          if (isFeedback) {
            if (spotify.style.display === 'block') {
              forms.style.display = 'none';
              chat_input.style.display = 'none';
              chat_input_send.style.display = 'none';
            } else {
              forms.style.display = 'block';
              forms.style.opacity = '1';
              chat_input.style.display = 'none';
              chat_input_send.style.display = 'none';
              chat_settings.style.marginRight = '-14px';
              sidebar.style.marginRight = '-14px';
              isFeedback = false;
            };
          } else {
            forms.style.display = 'none';
            forms.style.opacity = '0';
            chat_input.style.display = 'block';
            chat_input_send.style.display = 'block';
            chat_settings.style.marginRight = '0';
            sidebar.style.marginRight = '0px';
            isFeedback = true;
          }
        })

        // Get the #meet button and the container where you want to load the content
        var game = document.getElementById('meet');

        // Add an event listener to the #meet button
        game.addEventListener('click', function() {
          // Create a new XMLHttpRequest object
          var xhr = new XMLHttpRequest();

          // Set up the event listener for the request state change
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                // If the request is successful, update the content container with the response text
                chat_content_container.innerHTML = xhr.responseText;
              } else {
                console.warn('Did not receive 200 Ok from response!');
              }
            }
          };

          // Open the request and send it
          xhr.open('GET', 'polls.html');
          xhr.send();
        });

        var lightMode = document.getElementById('light_mode');
        var isLightMode = true; // Variable to track current mode
        lightMode.addEventListener('click', function() {
          if (isLightMode) {
            // Apply dark mode styles
            chat_container.style.backgroundColor = '#202020';
            chat_settings.style.backgroundColor = '#ffffff';
            chat_settings.style.color = '#000000';
            chat_settings.style.fontSize = '17px';
            participantsButton.style.backgroundColor = '#ffffff';
            participantsButton.style.color = '#000000';
            banButton.style.backgroundColor = '#ffffff';
            banButton.style.color = '#000000';
            sidebar.style.backgroundColor = '#000000';
            sidebar.style.color = '#ffffff';
            lightMode.style.color = '#ffffff';
            lightMode.style.fontSize = '26px';
            chat_input.style.color = '#ffffff';
            chat_input.style.backgroundColor = '#303030';
            chat_input.style.outline = '#474747 solid 1px';
            chat_logout.style.backgroundColor = '#000000';
            chat_logout.style.outline = '#ffffff';
            chat_logout.style.color = '#ffffff';
            document.documentElement.style.setProperty('--custom-scrollbar-track-color', '#000000');
            document.documentElement.style.setProperty('--custom-scrollbar-thumb-color', '#ffffff');
            document.documentElement.style.setProperty('--message-container-background-color', 'transparent');
            document.documentElement.style.setProperty('--message-container-color', '#bcbcbc');
            document.documentElement.style.setProperty('--message-user-color', '#ffffff');
            document.documentElement.style.setProperty('--chat-content-container-background-color', '#2e2e2e');
            document.documentElement.style.setProperty('--message-container-border', '#ffffff19');
            document.documentElement.style.setProperty('--buttons', '#ffffffa2');
            document.documentElement.style.setProperty('--buttons-hover', '#ffffff');
            isLightMode = false; // Update mode
          } else {
            // Apply light mode styles
            chat_container.style.backgroundColor = ''; // Revert to default
            chat_settings.style.backgroundColor = '#000000';
            chat_settings.style.color = '#ffffff';
            chat_settings.style.fontSize = '';
            participantsButton.style.backgroundColor = '#000000';
            participantsButton.style.color = '#ffffff';
            banButton.style.backgroundColor = '#000000';
            banButton.style.color = '#ffffff';
            sidebar.style.backgroundColor = '';
            sidebar.style.color = '';
            lightMode.style.color = '';
            lightMode.style.fontSize = '';
            chat_input.style.color = '';
            chat_input.style.backgroundColor = '';
            chat_input.style.outline = '';
            chat_logout.style.backgroundColor = '';
            chat_logout.style.outline = '';
            chat_logout.style.color = '';
            document.documentElement.style.setProperty('--custom-scrollbar-track-color', '');
            document.documentElement.style.setProperty('--custom-scrollbar-thumb-color', '');
            document.documentElement.style.setProperty('--message-container-background-color', '');
            document.documentElement.style.setProperty('--message-container-color', '');
            document.documentElement.style.setProperty('--message-user-color', '');
            document.documentElement.style.setProperty('--chat-content-container-background-color', '');
            document.documentElement.style.setProperty('--message-container-border', '');
            document.documentElement.style.setProperty('--buttons', '');
            document.documentElement.style.setProperty('--buttons-hover', '');
            isLightMode = true; // Update mode
          }
        });
        
        var chat_input_send = document.createElement('button')
        chat_input_send.setAttribute('id', 'chat_input_send')
        chat_input_send.setAttribute('disabled', true)
        chat_input_send.setAttribute('unsent', true)
        chat_input_send.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`

        var typing_indicator_container = document.createElement('div');
        typing_indicator_container.setAttribute('id', 'typing-indicator-container');
        typing_indicator_container.style.position = 'absolute';
        typing_indicator_container.style.marginTop = '-270px';
        typing_indicator_container.style.width = '62%';
        typing_indicator_container.style.maxWidth = '1000px';
        typing_indicator_container.style.minWidth = '450px';
        
        var chat_input = document.createElement('textarea')
        chat_input.setAttribute('id', 'chat_input')
        // Only a max message length of 1000
        chat_input.setAttribute('maxlength', 1000)
        // Get the name of the user
        chat_input.placeholder = `${parent.get_name()}, join the conversation!`

        let isTyping = false;
        chat_input.addEventListener('keydown', function() {
          // Send a message to the server/database indicating that the user has started typing
          db.ref('typing/' + parent.get_name()).set(true);
          isTyping = true;
        });

        // In the create_chat() function
        db.ref('typing').on('value', function(snapshot) {
          // Loop through the typing status updates and update the UI accordingly
          snapshot.forEach(function(childSnapshot) {
            var username = childSnapshot.key;
            var isTyping = childSnapshot.val();
            // Update the UI to show that the user is typing
            parent.updateTypingIndicator(username, isTyping);
          });
        });

        // Add event listener for page visibility change
        document.addEventListener('visibilitychange', function() {
          if (document.visibilityState === 'hidden') {
              // User switched tabs or closed the window
              // Update typing status to indicate that the user is not typing
              db.ref(`typing/${currentUser}`).set(false); // Assuming currentUser is the current user's username
          }
        });

        let typingTimer;
        chat_input.addEventListener('keyup', function() {
          // Clear the previous timer
          clearTimeout(typingTimer);
          // Set a new timer to detect when the user stops typing
          typingTimer = setTimeout(function() {
            // Send a message to the server/database indicating that the user has stopped typing
            db.ref('typing/' + parent.get_name()).set(false);
            isTyping = false;
          }, 1000); // 2 seconds of inactivity
        });

        chat_input.onkeyup  = function(){
          if(chat_input.value.length > 0){
            chat_input_send.removeAttribute('disabled');
            chat_input_send.setAttribute('unsent', true);
            chat_input_send.classList.add('enabled');
            chat_input_send.classList.remove('sent');

           
            chat_input_send.onclick = function(){
              chat_input_send.removeAttribute('unsent');
              chat_input_send.classList.add('sent');
              chat_input_send.setAttribute('disabled', true);
              chat_input_send.classList.remove('enabled');
              if(chat_input.value.trim().length <= 0 || chat_input.value.trim() === ''){
                return
              }
              // Enable the loading circle in the 'chat_content_container'
              parent.create_load('chat_content_container');
              // Send the message. Pass in the chat_input.value
              parent.send_message(chat_input.value.trim())
              // Clear the chat input box
              chat_input.value = ''
              // Focus on the input just after
              chat_input.focus()
            }

             // Check if the "@" character is present in the input
            var atIndex = chat_input.value.lastIndexOf('@');
            if (atIndex !== -1) {
                // Extract the username that follows the "@"
                var username = chat_input.value.substring(atIndex + 1).trim();

                // Check if the username matches any of the users in the chat
                var matchingUser = users.find(function(user) {
                  return user.toLowerCase() === username.toLowerCase();
                });

                if (matchingUser) {
                  // Create a new span element with the pinged username in blue
                  var pingElement = document.createElement('span');
                  pingElement.textContent = '@' + matchingUser;
                  pingElement.classList.add('ping-user');

                  // Replace the "@username" in the input with the styled element
                  var pingRegex = new RegExp('@' + matchingUser, 'i');
                  chat_input.value = chat_input.value.replace(pingRegex, pingElement.outerHTML);
                }
              }
          }else{
            chat_input_send.classList.remove('enabled');
            chat_input_send.classList.remove('sent');
          }
        }
        
        chat_input.addEventListener('keypress', function(event) {
          if (event.key === 'Enter' && chat_input_send.classList.contains('enabled','sent')) {
            setTimeout(function() {
              chat_input_send.click();
            }, 90); // Trigger the send button's click event
          }
        });

        var chat_logout_container = document.createElement('div')
        chat_logout_container.setAttribute('id', 'chat_logout_container')
  
        var chat_logout = document.createElement('button')
        chat_logout.setAttribute('id', 'chat_logout')
        //chat_logout.textContent = `${parent.get_name()} | Logout, <i class="fa-solid fa-right-from-bracket"></i>`
        chat_logout.innerHTML = `<img src="./SVGs/logour.svg" class="logout-icon-button"> Log out`;
        // "Logout" is really just deleting the name from the localStorage
        chat_logout.onclick = function(){
          // In the 'delete_all_messages()' function (or a similar function)
          var userName = app.get_name();
          db.ref('users/' + userName).remove()
          .then(function() {
            console.log('User removed from the database');
          })
          .catch(function(error) {
            console.error('Error removing user from the database:', error);
          });
          localStorage.clear();
          // Go back to home page
          //window.location.reload();
          parent.home();
        }

        sidebar.append(chat_logout_container)
        chat_logout_container.append(chat_logout)
        chat_input_container.append(chat_input, chat_input_send, chat_settings, typing_indicator_container)
        chat_inner_container.append(chat_content_container, chat_input_container)
        chat_container.append(chat_inner_container)
        document.body.append(chat_container, participantsPopup, banButton, sidebar, polls)
        // After creating the chat. We immediatly create a loading circle in the 'chat_content_container'
        parent.create_load('chat_content_container')
        // then we "refresh" and get the chat data from Firebase
        parent.refresh_chat()


       ordered.forEach(function(data) {
        var name = data.name;
        var message = data.message;
        var timestamp = data.timestamp; // Get the timestamp from the message data
        var isCurrentUser = name === parent.get_name(); // Check if the message is sent by the current user
      
        var message_container = document.createElement('div');
        message_container.setAttribute('class', `message_container`);
      
        var message_inner_container = document.createElement('div');
        message_inner_container.setAttribute('class', 'message_inner_container');

        var message_user_container = document.createElement('div');
        message_user_container.setAttribute('class', 'message_user_container');

        // Add the profile circle before the message_user element
        var profileCircle = createProfileCircle(name);
      
        var message_user = document.createElement('p');
        message_user.setAttribute('class', 'message_user');
        message_user.textContent = `${name}`;

        function formatTimestamp(timestamp) {
          const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12; // Convert 0 to 12
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
          const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          return `${formattedHours}:${formattedMinutes} ${ampm}, ${formattedDate}`;
        }
        var message_timestamp = document.createElement('p');
        message_timestamp.setAttribute('class', 'message_timestamp');
        message_timestamp.textContent = formatTimestamp(timestamp);
        //var formattedTimestamp = formatTimestamp(timestamp);
        //message_timestamp.textContent = formattedTimestamp; // Format the timestamp
        //message_timestamp.textContent = new Date(timestamp).toLocaleString();
        var message_content_container = document.createElement('div');
        message_content_container.setAttribute('class', 'message_content_container');
      
        var message_content = document.createElement('p');
        message_content.setAttribute('class', 'message_content');
        message_content.textContent = `${message}`;
      
        message_user_container.append(profileCircle, message_user, message_timestamp); // Append the timestamp after the name
        message_content_container.append(message_content);
        message_inner_container.append(message_user_container, message_content_container);
        message_container.append(message_inner_container);
      
        chat_content_container.append(message_container);
      });
      const lastMessage = chat_content_container.lastElementChild;
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
     }

     updateTypingIndicator(username, isTyping) {
      // Find the typing indicator element for the given username
      var typingIndicator = document.getElementById(`typing-indicator-${username}`);
      if (isTyping) {
        // Show the typing indicator
        if (!typingIndicator) {
          // Create a new typing indicator element
          typingIndicator = document.createElement('h2');
          typingIndicator.setAttribute('id', `typing-indicator-${username}`);
          typingIndicator.textContent = `${username} is typing...`;
          typingIndicator.style.position = 'absolute';
          typingIndicator.style.marginTop = '-90px';
          typingIndicator.style.width = 'fit-content';
          typingIndicator.style.minWidth = '200px';
          typingIndicator.style.maxWidth = '1000px';
          //typingIndicator.style.minWidth = '450px';
          typingIndicator.style.fontSize = '15px';
          typingIndicator.style.fontWeight = '200';
          typingIndicator.style.color = '#8a8a8a';
          typingIndicator.style.zIndex = '8888';
          typingIndicator.style.background = '#ffffff';
          typingIndicator.style.borderRadius = '10px';
          typingIndicator.style.padding = '5px 10px';
          typingIndicator.style.paddingRight = '30px';
          typingIndicator.style.marginLeft = '-47%';
          // Append the typing indicator to the typing indicator container
          chat_input_container.appendChild(typingIndicator);
        }
        } else {
        // Hide the typing indicator
          if (typingIndicator) {
          typingIndicator.remove();
          }
        }
      }

      // Save name. It literally saves the name to localStorage
      save_name(name){
        // Save name to localStorage
        localStorage.setItem('name', name)
      }    

      // Sends message/saves the message to firebase database
      send_message(message){
        var parent = this;
        // If the local storage name is null and there is no message,
        // then return/don't send the message. 
        // The user is somehow hacking to send messages,
        // or they just deleted the localstorage themselves.
        if (parent.get_name() == null || message == null || message.trim() === '') {
          return;
        }
        // Update the page title with the sender's name
        //document.title = `${parent.get_name()} sent a message`;

        // Function to apply Markdown italic formatting
        function makeItalic(text) {
          return '_@' + text + '_';
        }
        // Regular expression to match pinged usernames
        const pingRegex = /@(\w+)/g;
        const pingedUsernames = message.match(pingRegex);

        if (pingedUsernames) {
          pingedUsernames.forEach(function(pingedUsername) {
            // Extract username without the "@" symbol
            const username = pingedUsername.slice(1).toUpperCase();
            // Apply Markdown italic formatting to the username
            const italicUsername = makeItalic(username);
            // Replace the original pinged username with the italic username
            message = message.replace(pingedUsername, italicUsername);
          });
        }

        // Create a new timestamp for the message
        var timestamp = Date.now();
      
        // Get the firebase database reference
        var chatsRef = db.ref('chats/');
      
        // Get the number of existing messages to determine the index
        chatsRef.once('value', function(message_object) {
          var index = parseFloat(message_object.numChildren()) + 1;
      
          // Set the message data in the database
          var messageData = {
            name: parent.get_name(),
            message: message.trim(),
            timestamp: timestamp,
            index: index,
            sender: parent.get_name()
          };
      
          // Push the message data to the database
          chatsRef.child(`message_${index}`).set(messageData)
            .then(function() {
              // After we send the chat, refresh to get the new messages
              parent.refresh_chat();
            });
        });
      }

      // Get name. Gets the username from localStorage
      get_name(){
        // Get the name from localstorage
        if(localStorage.getItem('name') != null){
          return localStorage.getItem('name')
        }else{
          this.home()
          return null
        }
      }

      get_class() {
        // Get the class from localStorage
        if (localStorage.getItem('class') != null) {
          return localStorage.getItem('class');
        } else {
          this.home(); // Redirect to home or another function if class is not found
          return null;
        }
      }
    
      // Refresh chat gets the message/chat data from firebase
      refresh_chat(){
        var chat_content_container = document.getElementById('chat_content_container');
        // In the 'refresh_chat()' function (or a similar function)
        db.ref('users').on('value', function(snapshot) {
          var users = snapshot.val();
          if (users) {
            // Update the list of users in the chat
            updateUserList(Object.keys(users));
          }
        });

        // Get the chats from firebase
        db.ref('chats/').on('value', function(messages_object) {
          // When we get the data clear chat_content_container
          chat_content_container.innerHTML = ''
          // if there are no messages in the chat. Return . Don't load anything
          if(messages_object.numChildren() == 0){
            return
          }
          // OK! SO IF YOU'RE A ROOKIE CODER. THIS IS GOING TO BE
          // SUPER EASY-ISH! I THINK. MAYBE NOT. WE'LL SEE!
          // convert the message object values to an array.
          var messages = Object.values(messages_object.val());
          var guide = [] // this will be our guide to organizing the messages
          var unordered = [] // unordered messages
          var ordered = [] // we're going to order these messages
          for (var i, i = 0; i < messages.length; i++) {
            // The guide is simply an array from 0 to the messages.length
            guide.push(i+1)
            // unordered is the [message, index_of_the_message]
            unordered.push([messages[i], messages[i].index]);
          }
          // Now this is straight up from stack overflow 🤣
          // Sort the unordered messages by the guide
          guide.forEach(function(key) {
            var found = false
            unordered = unordered.filter(function(item) {
              if(!found && item[1] == key) {
                // Now push the ordered messages to ordered array
                ordered.push(item[0])
                found = true
                return false
              }else{
                return true
              }
            });
          });
          
          

          // Remove the "new-sent-message" class from newly sent messages after a delay
          setTimeout(function() {
            var newSentMessages = document.querySelectorAll('.new-sent-message');
            newSentMessages.forEach(function(message) {
              message.classList.remove('new-sent-message');
            });
          }, 5000); // Remove the class after 5 seconds (adjust the delay as needed)

          function receiveNewMessage(message) {
            // Code to receive a new message
          
            if (Notification.permission === 'granted') {
              const notification = new Notification('New Message', {
                body: message.sender + ': ' + message.content,
              });
              
              // Adjust notification behavior as needed
              notification.onclick = function () {
                // Handle click event when user clicks on the notification
              };
            }
          }
          // Function to create a profile circle
function createProfile(name) {
  var profile_circle = document.createElement('div');
  profile_circle.classList.add('profile_circle');
  
    // Generate a unique background colour for the profile circle based on the user's name
    var hue = (name.charCodeAt(0) * 137.508) % 100; // Use the character code of the first letter for better distribution
    hue = hue + 200; // Shift hue towards the blue-purple range
    profile_circle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`; // Keep saturation and lightness constant

  // Get the first letter of the name and convert it to uppercase
  var firstLetter = name.charAt(0).toUpperCase();
  profile_circle.textContent = firstLetter;

  return profile_circle;
}
          
          // Now we're done. Simply display the ordered messages
          ordered.forEach(function(data) {
            var name = data.name
            var message = data.message
            var timestamp = data.timestamp; // Get the timestamp from the message data
  
              var message_container = document.createElement('div')
              message_container.setAttribute('class', 'message_container')
  
              var message_inner_container = document.createElement('div')
              message_inner_container.setAttribute('class', 'message_inner_container')
    
              var message_user_container = document.createElement('div')
              message_user_container.setAttribute('class', 'message_user_container')

              // Create the profile circle for the user
              var profile_circle = createProfile(name);
    
              var message_user = document.createElement('p')
              message_user.setAttribute('class', 'message_user')
              message_user.textContent = `${name}`
    
              var message_content_container = document.createElement('div')
              message_content_container.setAttribute('class', 'message_content_container')
    
              var message_content = document.createElement('p')
              message_content.setAttribute('class', 'message_content')
              message_content.textContent = `${message}`

              // Regular expression to match Markdown italic syntax
              const italicRegex = /_(.+?)_/g;

              // Replace Markdown italic syntax with HTML <em> tags
              message_content.textContent = message.replace(italicRegex, '[$1]');

              function formatTimestamp(timestamp) {
                const date = new Date(timestamp);
                const options = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'long', year: 'numeric' };
                return date.toLocaleString('en-US', options);
              } 
  
              var message_timestamp = document.createElement('p');
              message_timestamp.setAttribute('class', 'message_timestamp');
              var formattedTimestamp = formatTimestamp(timestamp);
              message_timestamp.textContent = formattedTimestamp;
  
               message_user_container.append(profile_circle, message_user);
               message_content_container.append(message_content, message_timestamp); // Append the timestamp
               message_inner_container.append(message_user_container, message_content_container);
               message_container.append(message_inner_container);
  
               chat_content_container.append(message_container);
               // Update the previous message reference
            
            });
          // Go to the recent message at the bottom of the container
          chat_content_container.scrollTop = chat_content_container.scrollHeight;
        });
      };
    };
  
    // So we've "built" our app. Let's make it work!!
    var app = new MEME_CHAT();
    // If we have a name stored in localStorage.
    // Then use that name. Otherwise , if not.
    // Go to home.
    if(app.get_name() != null){
      app.chat();
      parent.home();
    };
    //if (app.get_name() != null) {
      //app.chat();
      // Delete all existing messages from the database
      //app.delete_all_messages();
    //}
  };

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
