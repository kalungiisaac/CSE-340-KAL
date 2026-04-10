document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('.pro-hamburger');
    const drawer = document.getElementById('sideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const closeBtn = document.querySelector('.drawer-close');
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let firstFocusableElement, lastFocusableElement;

    if (!openBtn || !drawer || !overlay) return;

    const updateFocusableElements = () => {
        const elements = drawer.querySelectorAll(focusableElements);
        firstFocusableElement = elements[0];
        lastFocusableElement = elements[elements.length - 1];
    };

    const openDrawer = () => {
        drawer.classList.add('open');
        overlay.classList.add('visible');
        openBtn.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        updateFocusableElements();
        setTimeout(() => firstFocusableElement?.focus(), 100);
    };

    const closeDrawer = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('visible');
        openBtn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        openBtn.focus();
    };

    openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = openBtn.getAttribute('aria-expanded') === 'true';
        expanded ? closeDrawer() : openDrawer();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
        
        // Focus Trap
        if (e.key === 'Tab' && drawer.classList.contains('open')) {
            if (e.shiftKey) { // shift + tab
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // tab
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // Close drawer on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
});
