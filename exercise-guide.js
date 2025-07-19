const { ipcRenderer } = require('electron');

ipcRenderer.on('exercise-data', (event, exercise) => {
    const content = document.getElementById('exerciseContent');
    content.innerHTML = `
        <h2>${exercise.title}</h2>
        <ol>
            ${exercise.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
    `;
});

document.getElementById('closeBtn').addEventListener('click', () => {
    ipcRenderer.send('close-exercise-guide');
});

document.getElementById('completeBtn').addEventListener('click', () => {
    ipcRenderer.send('close-exercise-guide');
});