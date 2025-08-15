// Firebase Real-time Voting App for "Kaja?" question
console.log('Firebase Voting App initializing...');

// FIREBASE CONFIGURATION
// Replace this with your own Firebase config
const firebaseConfig = {
  databaseURL: "https://kaja-voting-demo-default-rtdb.firebaseio.com/"
  // To use your own Firebase project:
  // 1. Go to https://console.firebase.google.com/
  // 2. Create a new project or use existing
  // 3. Enable Realtime Database
  // 4. Replace the databaseURL above with your project's database URL
  // 5. Add other config properties if needed (apiKey, authDomain, etc.)
};

// Global application state
let app = null;
let database = null;
let votesRef = null;
let isConnected = false;
let userVote = null; // Track current user's vote locally
let localVotes = { yes: 0, no: 0 }; // Fallback local state

// UI Elements
let yesBtn, noBtn, yesCount, noCount, totalCount, statusDot, statusText;

// Initialize Firebase
function initFirebase() {
  try {
    // Initialize Firebase app
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    votesRef = database.ref('votes');
    
    console.log('Firebase initialized successfully');
    
    // Set up connection monitoring
    const connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
      const connected = snapshot.val() === true;
      isConnected = connected;
      updateConnectionStatus(connected);
      
      if (connected) {
        console.log('Connected to Firebase');
        enableVoting();
        // Load initial data
        loadInitialVotes();
      } else {
        console.log('Disconnected from Firebase');
        updateConnectionStatus(false, 'Offline');
        enableVoting(); // Still allow voting in offline mode
      }
    });
    
    // Listen for vote changes
    votesRef.on('value', (snapshot) => {
      const votes = snapshot.val();
      if (votes) {
        console.log('Received vote update from Firebase:', votes);
        updateVoteCounts(votes.yes || 0, votes.no || 0);
        localVotes = { yes: votes.yes || 0, no: votes.no || 0 };
      }
    });
    
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    updateConnectionStatus(false, 'Offline mód');
    enableVoting(); // Enable local-only mode
  }
}

// Load initial votes from Firebase
function loadInitialVotes() {
  if (!votesRef) return;
  
  votesRef.once('value', (snapshot) => {
    const votes = snapshot.val();
    if (votes) {
      console.log('Loaded initial votes:', votes);
      updateVoteCounts(votes.yes || 0, votes.no || 0);
      localVotes = { yes: votes.yes || 0, no: votes.no || 0 };
    } else {
      // Initialize Firebase with zero votes
      votesRef.set({ yes: 0, no: 0 });
      console.log('Initialized vote structure');
    }
  });
}

// Update connection status in UI
function updateConnectionStatus(connected = isConnected, customMessage = null) {
  if (!statusDot || !statusText) return;
  
  if (customMessage) {
    statusDot.className = 'status-dot offline';
    statusText.textContent = customMessage;
  } else if (connected) {
    statusDot.className = 'status-dot online';
    statusText.textContent = 'Online - Valós idejű';
  } else {
    statusDot.className = 'status-dot connecting';
    statusText.textContent = 'Kapcsolódás...';
  }
}

// Enable voting buttons
function enableVoting() {
  if (yesBtn) yesBtn.disabled = false;
  if (noBtn) noBtn.disabled = false;
}

// Disable voting buttons
function disableVoting() {
  if (yesBtn) yesBtn.disabled = true;
  if (noBtn) noBtn.disabled = true;
}

// Update vote counts in UI
function updateVoteCounts(yesVotes, noVotes) {
  if (yesCount) {
    yesCount.textContent = yesVotes.toString();
    yesCount.classList.add('updated');
    setTimeout(() => yesCount.classList.remove('updated'), 400);
  }
  
  if (noCount) {
    noCount.textContent = noVotes.toString();
    noCount.classList.add('updated');
    setTimeout(() => noCount.classList.remove('updated'), 400);
  }
  
  if (totalCount) {
    totalCount.textContent = (yesVotes + noVotes).toString();
  }
  
  console.log(`Vote counts updated - Yes: ${yesVotes}, No: ${noVotes}`);
}

// Handle voting
function vote(voteType) {
  console.log(`Voting: ${voteType}`);
  
  // Don't allow duplicate votes
  if (userVote === voteType) {
    console.log(`Already voted ${voteType}, ignoring`);
    return;
  }
  
  // Calculate new vote counts
  let newYes = localVotes.yes;
  let newNo = localVotes.no;
  
  // Remove previous vote if exists
  if (userVote === 'yes') {
    newYes = Math.max(newYes - 1, 0);
  } else if (userVote === 'no') {
    newNo = Math.max(newNo - 1, 0);
  }
  
  // Add new vote
  if (voteType === 'yes') {
    newYes += 1;
  } else {
    newNo += 1;
  }
  
  // Update local state
  userVote = voteType;
  localVotes = { yes: newYes, no: newNo };
  
  // Update UI immediately
  updateVoteCounts(newYes, newNo);
  updateButtonStates();
  
  // Add visual feedback
  const button = voteType === 'yes' ? yesBtn : noBtn;
  if (button) {
    button.classList.add('voted', 'syncing');
    setTimeout(() => {
      button.classList.remove('voted', 'syncing');
    }, 600);
  }
  
  // Update Firebase if connected
  if (database && votesRef && isConnected) {
    console.log('Updating Firebase with new votes:', { yes: newYes, no: newNo });
    votesRef.set({ yes: newYes, no: newNo })
      .then(() => {
        console.log('Vote successfully saved to Firebase');
      })
      .catch((error) => {
        console.error('Error saving vote to Firebase:', error);
        // Keep local state as fallback
      });
  } else {
    console.log('Firebase not available, using local mode');
  }
}

// Update button visual states based on user's vote
function updateButtonStates() {
  if (!yesBtn || !noBtn) return;
  
  // Remove active state from both
  yesBtn.classList.remove('active');
  noBtn.classList.remove('active');
  
  // Add active state to current vote
  if (userVote === 'yes') {
    yesBtn.classList.add('active');
  } else if (userVote === 'no') {
    noBtn.classList.add('active');
  }
}

// Initialize DOM elements and event listeners
function initDOM() {
  // Get DOM elements
  yesBtn = document.getElementById('yes-btn');
  noBtn = document.getElementById('no-btn');
  yesCount = document.getElementById('yes-count');
  noCount = document.getElementById('no-count');
  totalCount = document.getElementById('total-count');
  statusDot = document.getElementById('status-indicator');
  statusText = document.getElementById('status-text');
  
  // Add event listeners
  if (yesBtn) {
    yesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      vote('yes');
    });
    console.log('Yes button listener added');
  }
  
  if (noBtn) {
    noBtn.addEventListener('click', (e) => {
      e.preventDefault();
      vote('no');
    });
    console.log('No button listener added');
  }
  
  console.log('DOM initialized');
}

// Initialize the application
function initApp() {
  console.log('Initializing Kaja voting app...');
  
  // Initialize DOM first
  initDOM();
  
  // Set initial connection status
  updateConnectionStatus(false, 'Kapcsolódás...');
  
  // Initialize vote counts to zero
  updateVoteCounts(0, 0);
  
  // Initialize Firebase
  if (typeof firebase !== 'undefined') {
    initFirebase();
  } else {
    console.error('Firebase SDK not loaded');
    updateConnectionStatus(false, 'Offline mód');
    enableVoting(); // Enable local-only mode
  }
  
  // Add fade-in effect
  const container = document.querySelector('.container');
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 100);
  }
  
  console.log('App initialization complete');
}

// Handle page visibility changes (for reconnection)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && database) {
    // Page became visible, check connection
    const connectedRef = database.ref('.info/connected');
    connectedRef.once('value', (snapshot) => {
      isConnected = snapshot.val() === true;
      updateConnectionStatus(isConnected);
    });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Backup initialization
setTimeout(initApp, 100);

console.log('Firebase Voting App script loaded');