window.addEventListener('DOMContentLoaded', () => {
    let isDown = false;
    let startX;
    let startY;
    let scrollLeft;
    let scrollTop;

    const body = document.body;

    body.style.cursor = 'grab';

    body.addEventListener('mousedown', (e) => {
        // Only drag if clicking on the body/canvas directly, not on slots or other interactive elements
        if (e.target !== body && e.target !== document.getElementById('canvas')) return;
        
        isDown = true;
        body.style.cursor = 'grabbing';
        startX = e.pageX - body.offsetLeft;
        startY = e.pageY - body.offsetTop;
        scrollLeft = window.scrollX;
        scrollTop = window.scrollY;
    });

    window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        body.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - body.offsetLeft;
        const y = e.pageY - body.offsetTop;
        const walkX = (x - startX);
        const walkY = (y - startY);
        window.scrollTo(scrollLeft - walkX, scrollTop - walkY);
    });
});
