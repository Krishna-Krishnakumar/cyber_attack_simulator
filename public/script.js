// Game state
const gameState = {
    score: 0,
    level: 1,
    timeRemaining: 300, // 5 minutes in seconds
    emailsInLevel: 0,
    completedEmails: 0,
    currentEmail: null,
    emailsProcessed: 0,
    timer: null,
    incorrectAttempts: 0,
    breachLevel: 0 // 0: Safe, 1: Warning, 2: Critical, 3: Compromised
};

// Global variables
let selectedEmailId = null;
let emailList = null;
let emailDetails = null;
let senderElem = null;
let emailAddressElem = null;
let subjectElem = null;
let dateElem = null;
let bodyElem = null;
let feedbackElem = null;

// Make submitChoice globally accessible
window.submitChoice = async function(isPhishing) {
    if (!selectedEmailId) {
        console.error("No email selected");
        showFeedback("error", "Please select an email first.");
        return;
    }

    try {
        console.log("Submitting choice:", { emailId: selectedEmailId, isPhishing });
        const response = await fetch("/api/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailId: selectedEmailId, userChoice: isPhishing })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Received response:", result);
        
        // Update game state
        updateGameState(result.isCorrect);
        
        if (result.isCorrect) {
            // Correct choice
            showFeedback("correct", result.message, "You've earned 100 points!");
        } else {
            // Incorrect choice
            gameState.score = Math.max(0, gameState.score - 50);
            gameState.incorrectAttempts++;
            updateScore();
            
            if (result.phishingType) {
                gameState.breachLevel = Math.min(3, gameState.breachLevel + 1);
                showAttackSimulation(result.redFlags);
                updateBreachStatus();
            }
            
            showFeedback("incorrect", result.message, "You've lost 50 points!");
        }

        // Update progress bar
        updateProgress();

        // Check if level is complete
        if (gameState.emailsProcessed === gameState.emailsInLevel) {
            showLevelComplete();
        }

        // Hide email details after choice
        document.getElementById('email-details').classList.add('hidden');
        selectedEmailId = null;

    } catch (error) {
        console.error("Error submitting choice:", error);
        showFeedback("error", `Error: ${error.message}`);
        // Don't hide email details on error so user can try again
    }
};

// Show feedback message
function showFeedback(type, message, subMessage = "") {
    const feedbackElem = document.getElementById("feedback");
    feedbackElem.textContent = message;
    feedbackElem.className = `feedback ${type}`;
    
    if (subMessage) {
        const subFeedback = document.createElement("div");
        subFeedback.className = "sub-feedback";
        subFeedback.textContent = subMessage;
        feedbackElem.appendChild(subFeedback);
    }
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
        feedbackElem.textContent = "";
        feedbackElem.className = "";
    }, 3000);
}

// Update breach status
function updateBreachStatus() {
    const header = document.querySelector('.app-header');
    header.className = 'app-header';
    
    switch(gameState.breachLevel) {
        case 1:
            header.classList.add('breach-warning');
            break;
        case 2:
            header.classList.add('breach-critical');
            break;
        case 3:
            header.classList.add('breach-compromised');
            break;
    }
}

// Show attack simulation with progressive severity
function showAttackSimulation(redFlags) {
    const attackSim = document.querySelector('.attack-simulation');
    const attackContent = document.querySelector('.attack-content');
    
    let attackMessage = "";
    let attackDetails = "";
    
    switch(gameState.breachLevel) {
        case 1:
            attackMessage = "Warning: Suspicious Activity Detected";
            attackDetails = "A suspicious login attempt was detected from an unknown location.";
            break;
        case 2:
            attackMessage = "Critical: System Breach Detected";
            attackDetails = "Unauthorized access detected. Sensitive data may be at risk.";
            break;
        case 3:
            attackMessage = "ALERT: System Compromised!";
            attackDetails = "CRITICAL BREACH: Multiple systems compromised. Immediate action required!";
            break;
    }
    
    document.getElementById('learning-point').textContent = redFlags;
    attackContent.innerHTML = `
        <h2><i class="fas fa-virus"></i> ${attackMessage}</h2>
        <p>${attackDetails}</p>
        <p>Learning Point: ${redFlags}</p>
    `;
    
    attackSim.classList.add('active');
    
    setTimeout(() => {
        attackSim.classList.remove('active');
    }, 5000);
}

// Start next level
window.startNextLevel = function() {
    gameState.level++;
    gameState.emailsProcessed = 0;
    gameState.incorrectAttempts = 0;
    gameState.breachLevel = 0;
    document.querySelector('.level-complete').classList.add('hidden');
    document.getElementById('level').textContent = gameState.level;
    updateBreachStatus();
    loadEmails();
};

// Show game over screen
function showGameOver() {
    const gameOver = document.createElement('div');
    gameOver.className = 'game-over';
    gameOver.innerHTML = `
        <div class="game-over-content">
            <h2><i class="fas fa-skull"></i> Game Over!</h2>
            <p>Too many security breaches detected!</p>
            <p>Final Score: ${gameState.score}</p>
            <button onclick="restartGame()" class="btn-safe">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
    document.body.appendChild(gameOver);
}

// Restart game
window.restartGame = function() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.incorrectAttempts = 0;
    gameState.breachLevel = 0;
    gameState.timeRemaining = 300;
    document.querySelector('.game-over').remove();
    updateScore();
    updateLevel();
    updateBreachStatus();
    startTimer();
    loadEmails();
};

// Fetch emails from backend
window.loadEmails = async function() {
    try {
        console.log("Fetching emails...");
        const response = await fetch("/api/emails");
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const emails = await response.json();
        console.log("Received emails:", emails);
        
        if (!Array.isArray(emails)) {
            emailList.innerHTML = `<p class='error-message'>Failed to load emails: Invalid response format</p>`;
            return;
        }

        if (emails.length === 0) {
            // Check if we've completed all emails or if there are no emails in the database
            if (gameState.completedEmails > 0) {
                emailList.innerHTML = `
                    <div class="completion-message">
                        <h2><i class="fas fa-trophy"></i> Congratulations!</h2>
                        <p>You've completed all available emails!</p>
                        <p>Final Score: ${gameState.score}</p>
                        <button onclick="restartGame()" class="btn-safe">
                            <i class="fas fa-redo"></i>
                            Play Again
                        </button>
                    </div>`;
            } else {
                emailList.innerHTML = `<p class='error-message'>No emails available in the database. Please contact support.</p>`;
            }
            return;
        }

        emailList.innerHTML = "";
        gameState.emailsInLevel = emails.length;

        // Add progress bar
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.innerHTML = `
            <div class="progress-text">Progress: ${gameState.completedEmails}/${gameState.emailsInLevel}</div>
            <div class="progress-track">
                <div class="progress-fill" style="width: ${(gameState.completedEmails / gameState.emailsInLevel) * 100}%"></div>
            </div>
        `;
        emailList.appendChild(progressBar);

        emails.forEach(email => {
            const emailItem = document.createElement("div");
            emailItem.className = "email-item";
            
            // Add visual cues for urgency
            if (email.subject.toLowerCase().includes("urgent") || 
                email.subject.toLowerCase().includes("immediate") ||
                email.subject.toLowerCase().includes("critical")) {
                emailItem.classList.add("urgent");
                emailItem.innerHTML = '<span class="urgency-badge">URGENT</span>';
            }

            emailItem.innerHTML += `
                <div class="email-header">
                    <span class="email-sender">${email.sender}</span>
                    <span class="email-subject">${email.subject}</span>
                    <span class="email-date">${new Date(email.date).toLocaleString()}</span>
                </div>
                <div class="email-preview">${email.content.substring(0, 100)}...</div>
            `;

            // Only add click handler if email is not completed
            if (!email.completed) {
                emailItem.onclick = () => showEmail(email);
            } else {
                emailItem.classList.add("completed");
                emailItem.innerHTML += '<div class="completed-badge">Completed</div>';
            }

            emailList.appendChild(emailItem);
        });
    } catch (error) {
        console.error("Error loading emails:", error);
        emailList.innerHTML = `<p class='error-message'>Failed to load emails: ${error.message}</p>`;
    }
}

// Show email details
function showEmail(email) {
    selectedEmailId = email.id;
    senderElem.textContent = email.sender;
    emailAddressElem.textContent = email.sender_email || email.sender;
    subjectElem.textContent = email.subject;
    dateElem.textContent = new Date(email.date).toLocaleString();
    bodyElem.innerHTML = email.content.replace(/\n/g, '<br>');
    emailDetails.classList.remove("hidden");
    feedbackElem.textContent = "";
    feedbackElem.className = "";
}

// Initialize game
function initializeGame() {
    updateScore();
    updateLevel();
    startTimer();
    loadEmails();
}

// Update score display
function updateScore() {
    document.getElementById("score").textContent = gameState.score;
}

// Update level display
function updateLevel() {
    document.getElementById("level").textContent = gameState.level;
}

// Update progress bar
function updateProgress() {
    const progressFill = document.querySelector(".progress-fill");
    const progress = (gameState.emailsProcessed / gameState.emailsInLevel) * 100;
    progressFill.style.width = `${progress}%`;
}

// Start game timer
function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    
    const timerElem = document.getElementById("timer");
    gameState.timer = setInterval(() => {
        gameState.timeRemaining--;
        
        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timer);
            showGameOver();
            return;
        }
        
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        timerElem.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Update game state when an email is completed
function updateGameState(isCorrect) {
    gameState.emailsProcessed++;
    gameState.completedEmails++;
    if (isCorrect) {
        gameState.score += 10;
    }
    updateScore();
    loadEmails(); // Reload emails to update progress
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize DOM elements
    emailList = document.getElementById("email-list");
    emailDetails = document.getElementById("email-details");
    senderElem = document.getElementById("email-sender");
    emailAddressElem = document.getElementById("email-address");
    subjectElem = document.getElementById("email-subject");
    dateElem = document.getElementById("email-date");
    bodyElem = document.getElementById("email-body");
    feedbackElem = document.getElementById("feedback");

    // Initialize game
    initializeGame();
});
