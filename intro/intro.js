// js/intro.js
import { INTRO_CONTENT } from './intro_data.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Header
    document.getElementById('top-bar-title').textContent = INTRO_CONTENT.headerTitle;
    const btn = document.getElementById('action-btn');
    btn.textContent = `${INTRO_CONTENT.buttonLabel} →`;
    btn.onclick = () => window.open(INTRO_CONTENT.buttonLink, '_self');

    // 2. Main Title
    document.getElementById('main-title').textContent = INTRO_CONTENT.mainHeading;

    // 3. Content Injection
    const contentArea = document.getElementById('main-desc');
    
    // Create Student List Items (No bullets, styled by CSS)
    const studentListHTML = INTRO_CONTENT.students
        .map(student => `<li>${student}</li>`)
        .join('');

    contentArea.innerHTML = `
        <div class="section-block">
            <h3 class="section-title">${INTRO_CONTENT.aimTitle}</h3>
            <p class="section-text">${INTRO_CONTENT.aimContent}</p>
        </div>

        <div class="section-block">
            <h3 class="section-title">${INTRO_CONTENT.ackTitle}</h3>
            <p class="section-text">${INTRO_CONTENT.ackContent}</p>
        </div>

        <div class="section-block">
            <ul class="student-grid">
                ${studentListHTML}
            </ul>
        </div>
    `;

    // 4. Footer
    const footer = document.getElementById('intro-footer');
    footer.innerHTML = `<p>Developed and coordinated by: Dr. S.Vijayakumar, Dr.S.Sathish Department of Production Technology, MIT Campus, Anna University, Chennai.</p>`;
});