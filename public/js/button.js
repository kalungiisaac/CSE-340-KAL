 document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.button');
    const heading = document.getElementById('main-heading');
    
    // Safety check - exit if elements missing
    if (!button || !heading) {
        console.error("Button or heading element not found!");
        return;
    }

    // Store original title from server
    const originalTitle = heading.textContent;
    let isShowingThankYou = false;

    button.addEventListener('click', function() {
        if (isShowingThankYou) {
            // Revert to original title
            heading.textContent = originalTitle;
            isShowingThankYou = false;
        } else {
            // Show thank you message
            heading.textContent = "Thank you for joining us in CSE 340 Service Network!, We are excited to have you on board.";
            isShowingThankYou = true;
        }
    });
});