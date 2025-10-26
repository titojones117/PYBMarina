document.addEventListener("DOMContentLoaded", function() {
    var hand = document.querySelector('.hand');
    
    if (hand) {
        document.addEventListener("mousemove", function(e) {
            // Get the hand image to calculate offset based on its size
            var handImg = hand.querySelector('img');
            if (handImg) {
                // Position cursor on palm area (adjust these values as needed)
                var palmOffsetX = handImg.offsetWidth * 0.5;  // 50% of width (center)
                var palmOffsetY = handImg.offsetHeight * 0.10; // 100% of height (higher up on hand)
                
                hand.style.left = (e.pageX - palmOffsetX) + 'px';
                hand.style.top = (e.pageY - palmOffsetY) + 'px';
            }
        });
    }
});

document.addEventListener("mousedown", function(e) {
    if (e.button === 0) {
        var handImg = document.querySelector('.hand img');
        if (handImg) {
            handImg.src = "img/hand_grip.png";
        }
    }
});

document.addEventListener("mouseup", function(e) {
    if (e.button === 0) {
        var handImg = document.querySelector('.hand img');
        if (handImg) {
            handImg.src = "img/hand.png";
        }
    }
});

// Customer and order generation system
const CUSTOMERS = ['Banana', 'Christmas', 'Girl', 'Karen', 'Man', 'Old'];
const EMOTIONS = ['Normal', 'Happy', 'Angry'];
const TOPPINGS = ['Eyeballs', 'Toes', 'Tomato Sauce', 'Webs', 'Flies', 'Brains', 'Intestines', 'Toe Nails'];

// Mapping ingredients to their integer values
const INGREDIENT_VALUES = {
    'eyeballs': 0,      // Eyeballs
    'toes': 1,          // Toes
    'tomato-sauce': 2,  // Tomato Sauce
    'webs': 3,          // Webs
    'flies': 4,         // Flies
    'brains': 5,        // Brains
    'intestines': 6,    // Intestines
    'toenails': 7       // Toe Nails
};

let currentCustomer = null;
let customerTimer = null;
let timeRemaining = 15; // 15 seconds per customer
let happyCustomerCount = 0;
let angryCustomerCount = 0;
let gameOver = false;
let currentPizzaToppings = []; // List to store selected topping values
let currentCustomerOrder = []; // List to store customer's required toppings

// Timer and game state management
function updateTimerDisplay() {
    const timerText = document.getElementById('timer-text');
    if (timerText) {
        timerText.textContent = timeRemaining;
        
        // Change color based on time remaining
        timerText.classList.remove('warning', 'danger');
        if (timeRemaining <= 5) {
            timerText.classList.add('danger');
        } else if (timeRemaining <= 10) {
            timerText.classList.add('warning');
        }
    }
}

function updateAngryCountDisplay() {
    const angryCount = document.getElementById('angry-count');
    if (angryCount) {
        angryCount.textContent = angryCustomerCount;
    }
}

function updateHappyCountDisplay() {
    const happyCount = document.getElementById('happy-count');
    if (happyCount) {
        happyCount.textContent = happyCustomerCount;
    }
}

function makeCustomerAngry() {
    if (currentCustomer && currentCustomer.emotion !== 'Angry') {
        currentCustomer.emotion = 'Angry';
        
        // Update customer image to angry
        const customerImg = document.getElementById('customer-img');
        const orderText = document.getElementById('order-text');
        const serveBtn = document.getElementById('serve-btn');
        
        if (customerImg) {
            customerImg.src = `img/NPCS/${currentCustomer.type}/Angry.png`;
        }
        
        // Update order text to show customer is leaving angry
        if (orderText) {
            var audio = new Audio('music/Deanna.mp3');
            audio.play();
            orderText.textContent = "I'm leaving! This service is terrible!";
        }
        
        // Disable serve button - customer is leaving
        if (serveBtn) {
            serveBtn.disabled = true;
            serveBtn.textContent = "Customer Leaving...";
        }
        
        // Increment angry customer count
        angryCustomerCount++;
        updateAngryCountDisplay();
        
        // Clear the pizza when customer gets angry
        clearPizza();
                
        // Check for game over
        if (angryCustomerCount >= 3) {
            triggerGameOver();
            return;
        }
        
        // Customer leaves angry after showing angry state for 3 seconds
        setTimeout(() => {
            if (!gameOver) {
                generateRandomCustomer();
            }
        }, 3000);
    }
}

function triggerGameOver() {
    gameOver = true;
    clearInterval(customerTimer);
    
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        var audio = new Audio('music/gameover.mp3');
        audio.play();
        gameOverScreen.style.display = 'flex';
    }
    
    console.log('Game Over! Too many angry customers.');
}

function restartGame() {
    gameOver = false;
    happyCustomerCount = 0;
    angryCustomerCount = 0;
    timeRemaining = 15;

    updateHappyCountDisplay();
    updateAngryCountDisplay();
    updateTimerDisplay();
    
    // Clear the pizza
    clearPizza();
    
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        gameOverScreen.style.display = 'none';
    }
    
    generateRandomCustomer();
    console.log('Game restarted!');
}

function startCustomerTimer() {
    // Clear any existing timer
    if (customerTimer) {
        clearInterval(customerTimer);
    }
    
    timeRemaining = 15;
    updateTimerDisplay();
    
    customerTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Update customer emotion based on time
        if (timeRemaining <= 5 && currentCustomer && currentCustomer.emotion === 'Normal') {
            // Customer becomes unhappy when time is running low
            currentCustomer.emotion = 'Normal'; // Using Happy as intermediate state
            const customerImg = document.getElementById('customer-img');
            if (customerImg) {
                customerImg.src = `img/NPCS/${currentCustomer.type}/Normal.png`;
            }
        }
        
        // Time's up!
        if (timeRemaining <= 0) {
            clearInterval(customerTimer);
            makeCustomerAngry();
        }
    }, 1000);
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomOrder() {
    // Generate 1-4 random toppings
    const numToppings = Math.floor(Math.random() * 4) + 1;
    const selectedToppings = [];
    const selectedValues = [];
    
    for (let i = 0; i < numToppings; i++) {
        let topping;
        do {
            topping = getRandomElement(TOPPINGS);
        } while (selectedToppings.includes(topping));
        selectedToppings.push(topping);
        
        // Convert topping name to ingredient value
        const toppingIndex = TOPPINGS.indexOf(topping);
        selectedValues.push(toppingIndex);
    }
    
    // Store the required order for comparison
    currentCustomerOrder = selectedValues.sort((a, b) => a - b); // Sort for easier comparison
    
    // Create order text
    let orderText;
    if (selectedToppings.length === 1) {
        orderText = `I would like a pizza with ${selectedToppings[0]}.`;
    } else if (selectedToppings.length === 2) {
        orderText = `I would like a pizza with ${selectedToppings[0]} and ${selectedToppings[1]}.`;
    } else {
        const lastTopping = selectedToppings.pop();
        orderText = `I would like a pizza with ${selectedToppings.join(', ')}, and ${lastTopping}.`;
    }
    return orderText;
}

var customers_satisfied = 0;

function generateRandomCustomer() {
    // Don't generate new customers if game is over
    if (gameOver) {
        return;
    }
    
    // Clear any existing timer first
    if (customerTimer) {
        clearInterval(customerTimer);
    }
    
    // Show TV static first
    const customerImg = document.getElementById('customer-img');
    const orderText = document.getElementById('order-text');
    
    if (customerImg) {
        customerImg.src = 'img/static.gif';
        customerImg.alt = 'TV Static';
    }
    
    if (orderText) {
        orderText.textContent = '...';
    }
    
    // After 1.5 seconds of static, show the new customer
    setTimeout(() => {
        const customerType = getRandomElement(CUSTOMERS);
        // Always start with Normal emotion
        const emotion = 'Normal';
        
        currentCustomer = {
            type: customerType,
            emotion: emotion,
            order: generateRandomOrder()
        };
        
        // Update customer image to the new customer
        if (customerImg) {
            customerImg.src = `img/NPCS/${customerType}/${emotion}.png`;
            customerImg.alt = `${customerType} Customer - ${emotion}`;
        }
        
        // Update order text
        if (orderText) {
            orderText.textContent = currentCustomer.order;
        }
        
        // Re-enable serve button for new customer
        const serveBtn = document.getElementById('serve-btn');
        if (serveBtn) {
            serveBtn.disabled = false;
            serveBtn.textContent = "Serve Pizza";
        }
        
        // Start the timer for this customer
        startCustomerTimer();
        
        console.log(`New customer: ${customerType} (${emotion}) - ${currentCustomer.order}`);
    }, 1500);
}

// Generate initial customer when page loads
document.addEventListener('DOMContentLoaded', function() {
    generateRandomCustomer();
});

// Add button event listener for new customer generation
document.addEventListener('DOMContentLoaded', function() {
    const serveBtn = document.getElementById('serve-btn');
    if (serveBtn) {
        serveBtn.addEventListener('click', serveCustomer);
    }
    
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Initialize game state displays
    updateAngryCountDisplay();
    updateHappyCountDisplay();
    updateTimerDisplay();
    
    // Initialize click functionality
    initializeIngredientClicks();
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (gameOver) {
        if (e.key === 'r' || e.key === 'R') {
            restartGame();
        }
        return;
    }
    
    if (e.key === ' ' || e.key === 'Enter') {
        // Serve the customer (space or enter)
        serveCustomer();
        e.preventDefault();
    }
});

// Function to serve the current customer
function serveCustomer() {
    if (!currentCustomer || gameOver) {
        return;
    }
    
    // Can't serve an angry customer who is already leaving
    if (currentCustomer.emotion === 'Angry') {
        console.log("Cannot serve - customer is already angry and leaving!");
        return;
    }
    
    // Clear the timer
    clearInterval(customerTimer);
    
    // Check if pizza matches customer order
    const sortedPizzaToppings = [...currentPizzaToppings].sort((a, b) => a - b);
    const sortedCustomerOrder = [...currentCustomerOrder].sort((a, b) => a - b);
    
    console.log('Pizza toppings:', sortedPizzaToppings);
    console.log('Customer order:', sortedCustomerOrder);
    
    const orderMatches = JSON.stringify(sortedPizzaToppings) === JSON.stringify(sortedCustomerOrder);
    
    if (orderMatches) {
        // Customer is happy - correct order
        currentCustomer.emotion = 'Happy';
        const customerImg = document.getElementById('customer-img');
        const orderText = document.getElementById('order-text');
        
        if (customerImg) {
            customerImg.src = `img/NPCS/${currentCustomer.type}/Happy.png`;
        }
        
        if (orderText) {
            happyCustomerCount++;
            updateHappyCountDisplay();
            var audio = new Audio('music/thank.mp3');
            audio.play();
            orderText.textContent = "Thank you! This pizza looks delicious!";
        }
        
    } else {
        // Customer is angry - wrong order
        makeCustomerAngry();
        return;
    }
    
    // Clear the pizza for next customer
    clearPizza();
    
    // Generate next customer after showing result for 1.5 seconds
    setTimeout(() => {
        if (!gameOver) {
            generateRandomCustomer();
        }
    }, 1500);
}
function vacuumFunction() {
    var audio = new Audio('music/clear.mp3');
    audio.play();
}
// Pizza building functions
function clearPizza() {
    currentPizzaToppings = [];
    const pizzaToppingsDiv = document.getElementById('pizza-toppings');
    if (pizzaToppingsDiv) {
        pizzaToppingsDiv.innerHTML = '';
    }
}

function addToppingToPizza(ingredientValue, toppingName) {
    currentPizzaToppings.push(ingredientValue);
    const pizzaToppingsDiv = document.getElementById('pizza-toppings');
    if (pizzaToppingsDiv) {
        const toppingElement = document.createElement('div');
        toppingElement.className = 'pizza-topping';
        toppingElement.textContent = toppingName;
        toppingElement.setAttribute('data-value', ingredientValue);
        pizzaToppingsDiv.appendChild(toppingElement);
    }
    console.log('Added topping:', toppingName, 'Value:', ingredientValue);
    console.log('Current pizza:', currentPizzaToppings);
}

// Click functionality for ingredients
function initializeIngredientClicks() {
    const ingredients = document.querySelectorAll('.ingredient');
    
    ingredients.forEach(ingredient => {
        // Click functionality only
        ingredient.addEventListener('click', function(e) {
            const ingredientId = this.id;
            const ingredientValue = INGREDIENT_VALUES[ingredientId];
            const ingredientName = TOPPINGS[ingredientValue];
            
            addToppingToPizza(ingredientValue, ingredientName);
            
            // Visual feedback for click (though invisible, this might affect other properties)
            console.log(`Added ${ingredientName} to pizza`);
        });
    });
    
    // Clear pizza button
    const clearButton = document.getElementById('clear-pizza');
    if (clearButton) {
        clearButton.addEventListener('click', clearPizza);
    }
}

