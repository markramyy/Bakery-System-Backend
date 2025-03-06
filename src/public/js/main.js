document.addEventListener('DOMContentLoaded', () => {
    // Add enhanced hover effect to the bakery icon
    const bakeryIcon = document.querySelector('.bakery-icon');

    if (bakeryIcon) {
        bakeryIcon.addEventListener('mouseover', () => {
            bakeryIcon.style.transform = 'scale(1.2) rotate(8deg)';
            bakeryIcon.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });

        bakeryIcon.addEventListener('mouseout', () => {
            bakeryIcon.style.transform = '';
        });
    }

    // Button effect with ripple
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button) => {
        // Add hover effect
        button.addEventListener('mouseover', () => {
            button.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });

        // Add ripple effect on click
        button.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;

            let ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add parallax effect to bakery items
    document.addEventListener('mousemove', (e) => {
        const items = document.querySelectorAll('.bakery-items .item');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        items.forEach((item, index) => {
            // Different parallax strength for each item
            const strength = 20 + index * 5;
            const moveX = (mouseX - 0.5) * strength;
            const moveY = (mouseY - 0.5) * strength;

            // Apply transform with the existing animation
            item.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    // Add animation to features
    const features = document.querySelectorAll('.feature-icon');

    features.forEach((feature, index) => {
        // Stagger the animations
        setTimeout(() => {
            feature.classList.add('animate__animated', 'animate__heartBeat');

            // Remove animation after it completes to allow it to happen again on hover
            setTimeout(() => {
                feature.classList.remove('animate__animated', 'animate__heartBeat');
            }, 1000);
        }, index * 200);

        // Add hover animation
        feature.addEventListener('mouseenter', () => {
            feature.classList.add('animate__animated', 'animate__heartBeat');
        });

        feature.addEventListener('animationend', () => {
            feature.classList.remove('animate__animated', 'animate__heartBeat');
        });
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.innerHTML = `
        .btn {
            position: relative;
            overflow: hidden;
        }

        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
