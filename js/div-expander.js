document.addEventListener('DOMContentLoaded', function () {
    const boxes = document.querySelectorAll('.inside-box');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const container = document.querySelector('.expanding-box-container');
    let currentBox = null;

    function expandBox(box) {
        container.classList.add('active');
        boxes.forEach(b => b.classList.remove('expanded'));
        box.classList.add('expanded');
        currentBox = box;
        checkArrows();
    }

    function checkArrows() {
        if (!currentBox) {
            // hide arrows if no box is expanded
            arrowLeft.style.display = 'none';
            arrowRight.style.display = 'none';
            return;
        }

        const hasPrev = currentBox.previousElementSibling && currentBox.previousElementSibling.classList.contains('inside-box');
        const hasNext = currentBox.nextElementSibling && currentBox.nextElementSibling.classList.contains('inside-box');

        arrowLeft.style.display = hasPrev ? 'block' : 'none';
        arrowRight.style.display = hasNext ? 'block' : 'none';

        console.log("Arrows checked: ", { hasPrev, hasNext });

        arrowLeft.onclick = (e) => {
            e.stopPropagation();
            console.log('Navigating left');
            navigateBox('prev');
        };
        arrowRight.onclick = (e) => {
            e.stopPropagation();
            console.log('Navigating right');
            navigateBox('next');
        };
    }

    function navigateBox(direction) {
        if (!currentBox) {
            console.log('No current box selected');
            return;
        }

        const targetBox = direction === 'prev'
            ? currentBox.previousElementSibling
            : currentBox.nextElementSibling;

        if (targetBox && targetBox.classList.contains('inside-box')) {
            console.log("Navigating to box:", targetBox);

            container.classList.remove('active');
            currentBox.classList.remove('expanded');

            currentBox = targetBox;

            expandBox(currentBox);

            simulateClickEffect(currentBox);

            checkArrows();
        } else {
            console.log('No valid target box found');
        }
    }

    function simulateClickEffect(box) {
        console.log('Simulating click effect on the box:', box);
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        });
        box.dispatchEvent(clickEvent);
    }

    boxes.forEach(box => {
        box.addEventListener('click', (e) => {
            e.stopPropagation();
            expandBox(box);
        });
    });

    document.addEventListener('click', () => {
        container.classList.remove('active');
        boxes.forEach(box => box.classList.remove('expanded'));
        currentBox = null;
        checkArrows();
    });
});
