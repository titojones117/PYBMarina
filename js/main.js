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