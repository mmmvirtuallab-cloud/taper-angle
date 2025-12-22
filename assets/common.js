// common.js: Loads the nav bar from nav-template.html into the page

document.addEventListener('DOMContentLoaded', function() {
    var navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('nav-template.html')
            .then(response => response.text())
            .then(html => {
                navPlaceholder.innerHTML = html;
                // Optionally, set the active nav item based on the current page
                var links = navPlaceholder.querySelectorAll('.nav-link');
                var current = window.location.pathname.split('/').pop();
                links.forEach(link => {
                    if (link.getAttribute('href') === current) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            });
    }
});
