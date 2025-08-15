// Simple and Direct Voting App JavaScript

console.log('Script loaded');

// Global state
window.votingState = {
  yesVotes: 0,
  noVotes: 0,
  userVote: null
};

function updateCounts() {
  console.log('Updating counts:', window.votingState);
  
  const yesElement = document.getElementById('yes-count');
  const noElement = document.getElementById('no-count');
  const totalElement = document.getElementById('total-count');
  
  if (yesElement) {
    yesElement.innerHTML = window.votingState.yesVotes.toString();
    console.log('Updated yes count to:', window.votingState.yesVotes);
  }
  
  if (noElement) {
    noElement.innerHTML = window.votingState.noVotes.toString();
    console.log('Updated no count to:', window.votingState.noVotes);
  }
  
  if (totalElement) {
    const total = window.votingState.yesVotes + window.votingState.noVotes;
    totalElement.innerHTML = total.toString();
    console.log('Updated total count to:', total);
  }
}

function updateButtonStates() {
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  
  // Remove active from both
  if (yesBtn) yesBtn.classList.remove('active');
  if (noBtn) noBtn.classList.remove('active');
  
  // Add active to current vote
  if (window.votingState.userVote === 'yes' && yesBtn) {
    yesBtn.classList.add('active');
  } else if (window.votingState.userVote === 'no' && noBtn) {
    noBtn.classList.add('active');
  }
}

function voteYes() {
  console.log('Vote YES clicked');
  
  // If already voted yes, do nothing
  if (window.votingState.userVote === 'yes') {
    console.log('Already voted yes');
    return;
  }
  
  // Remove previous vote if exists
  if (window.votingState.userVote === 'no') {
    window.votingState.noVotes--;
  }
  
  // Add yes vote
  window.votingState.yesVotes++;
  window.votingState.userVote = 'yes';
  
  updateCounts();
  updateButtonStates();
}

function voteNo() {
  console.log('Vote NO clicked');
  
  // If already voted no, do nothing
  if (window.votingState.userVote === 'no') {
    console.log('Already voted no');
    return;
  }
  
  // Remove previous vote if exists
  if (window.votingState.userVote === 'yes') {
    window.votingState.yesVotes--;
  }
  
  // Add no vote
  window.votingState.noVotes++;
  window.votingState.userVote = 'no';
  
  updateCounts();
  updateButtonStates();
}

// Initialize when page loads
function initApp() {
  console.log('Initializing app');
  
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  
  if (yesBtn) {
    yesBtn.onclick = function(e) {
      e.preventDefault();
      voteYes();
      return false;
    };
    console.log('Yes button listener added');
  }
  
  if (noBtn) {
    noBtn.onclick = function(e) {
      e.preventDefault();
      voteNo();
      return false;
    };
    console.log('No button listener added');
  }
  
  // Initial display
  updateCounts();
  updateButtonStates();
  
  console.log('App initialized');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Backup initialization
setTimeout(initApp, 100);

// Fade in effect
document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.container');
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease-out';
    
    setTimeout(() => {
      container.style.opacity = '1';
    }, 100);
  }
});

console.log('Script setup complete');