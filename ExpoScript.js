/*
// Sample product data
const productDatabase = {
    'iphone': [
        { name: 'iPhone 15 Pro', price: '$999', store: 'Apple Official', availability: 'In Stock' },
        { name: 'iPhone 15 Pro', price: '$949', store: 'Best Buy', availability: 'In Stock' },
        { name: 'iPhone 15 Pro', price: '$899', store: 'Amazon', availability: 'Limited Stock' }
    ],
    'laptop': [
        { name: 'MacBook Pro 14"', price: '$1,999', store: 'Apple Official', availability: 'In Stock' },
        { name: 'MacBook Pro 14"', price: '$1,899', store: 'Best Buy', availability: 'In Stock' },
        { name: 'Dell XPS 13', price: '$1,299', store: 'Dell Direct', availability: 'In Stock' },
        { name: 'Dell XPS 13', price: '$1,249', store: 'Amazon', availability: 'Limited Stock' }
    ],
    'headphones': [
        { name: 'AirPods Pro 2', price: '$249', store: 'Apple Official', availability: 'In Stock' },
        { name: 'AirPods Pro 2', price: '$229', store: 'Best Buy', availability: 'In Stock' },
        { name: 'Sony WH-1000XM5', price: '$399', store: 'Amazon', availability: 'In Stock' },
        { name: 'Sony WH-1000XM5', price: '$379', store: 'Best Buy', availability: 'In Stock' }
    ],
    'watch': [
        { name: 'Apple Watch Series 9', price: '$399', store: 'Apple Official', availability: 'In Stock' },
        { name: 'Apple Watch Series 9', price: '$379', store: 'Best Buy', availability: 'In Stock' },
        { name: 'Apple Watch Ultra', price: '$799', store: 'Apple Official', availability: 'Limited Stock' }
    ],
    'ipad': [
        { name: 'iPad Pro 12.9"', price: '$1,099', store: 'Apple Official', availability: 'In Stock' },
        { name: 'iPad Pro 12.9"', price: '$1,049', store: 'Best Buy', availability: 'In Stock' },
        { name: 'iPad Air', price: '$599', store: 'Amazon', availability: 'In Stock' }
    ]
};
*/
// Set random background on page load
window.addEventListener('DOMContentLoaded', function() {
    const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7'];
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.classList.add(randomBg);

    // Add Enter key listener to trigger search when pressing Enter
    const searchInputEl = document.getElementById('searchInput');
    if (searchInputEl) {
        searchInputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
});

/* Not needed anymore
// Function to search and display matching products
function searchProducts(query) {
    const queryLower = query.toLowerCase();
    
    // Search through the database for matching products
    for (let key in productDatabase) {
        if (key.includes(queryLower) || queryLower.includes(key)) {
            return productDatabase[key];
        }
    }
    
    // Return null if no match found
    return null;
}
*/
let currentSearchId = 0; // used to ignore stale search results
const MIN_SPINNER_MS = 400; // minimum time (ms) the spinner should be visible to avoid flashing on fast responses

// Function to create HTML for result items
function createResultHTML(products) {
    let html = '';
    products.forEach(product => {
        // Use the product link if available, otherwise use a harmless '#'
        const href = (product.link && product.link !== '#') ? product.link : '#';
        const safeHref = String(href).replace(/"/g, '&quot;');
        html += `
            <div class="resultItem">
                <a class="resultLink" href="${safeHref}" target="_blank" rel="noopener noreferrer">
                    <h3>${product.name}</h3>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p><strong>Store:</strong> ${product.store}</p>
                    <p><strong>Availability:</strong> ${product.availability}</p>
                </a>
            </div>
        `;
    });
    return html;
}

// Function to open product link in new tab
function openProductLink(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    }
}

// Function to handle search button click
async function handleSearch() {
    const searchInputEl = document.getElementById('searchInput');
    const searchInput = searchInputEl ? searchInputEl.value.trim() : '';
    
    // Validate input
    if (!searchInput) {
        alert('Please enter a search term');
        return;
    }
    
    // Hide search page and show results page
    document.getElementById('searchPage').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    // Display the search term at the top
    document.getElementById('searchTitle').textContent = 'Search Results for: "' + searchInput + '"';
    
    // Search for products matching the input
    const resultsDiv = document.getElementById('resultsDiv');

    // Increment search id to track the latest search and ignore stale responses
    const searchId = ++currentSearchId;

    // Clear previous results and show a floating loader overlay (so header/back aren't affected)
    resultsDiv.innerHTML = '';
    const resultsPageEl = document.getElementById('resultsPage');
    let overlay = null;

    // Create overlay element and position it just below the back button/header
    overlay = document.createElement('div');
    overlay.className = 'loaderOverlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = '<div class="loader" aria-hidden="true" title="Loading results"></div>';

    // Calculate top offset so overlay sits below the header/back button
    const backBtn = resultsPageEl.querySelector('.backButton');
    let topOffset = 10; // fallback
    if (backBtn) {
        const rpRect = resultsPageEl.getBoundingClientRect();
        const btnRect = backBtn.getBoundingClientRect();
        topOffset = Math.max(btnRect.bottom - rpRect.top + 10, 10);
    }
    overlay.style.top = topOffset + 'px';
    overlay.style.bottom = '20px';
    resultsPageEl.appendChild(overlay);

    // Record spinner start time so we can enforce a minimum display duration
    const spinnerStart = Date.now();

    // Disable input and button while searching
    const searchButton = document.querySelector('#searchPage button');
    if (searchButton) searchButton.disabled = true;
    if (searchInputEl) searchInputEl.disabled = true;

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchInput })
        });
        
        const data = await response.json();

        // Ensure the spinner stays visible for at least MIN_SPINNER_MS to avoid flashing
        const elapsed = Date.now() - spinnerStart;
        if (elapsed < MIN_SPINNER_MS) {
            await new Promise(resolve => setTimeout(resolve, MIN_SPINNER_MS - elapsed));
        }

        // If a newer search started during the wait, ignore this response
        if (searchId !== currentSearchId) return;
        
        if (data.success && data.results.length > 0) {
            // Remove overlay before showing results
            if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
            resultsDiv.innerHTML = createResultHTML(data.results);

            // Navigation is handled by the <a> links inside each .resultItem (supports keyboard and mouse actions)

        } else {
            if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
            resultsDiv.innerHTML = '<p style="color: white; text-align: center; padding: 40px;">No products found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error:', error);

        // Ensure spinner visible for minimum time even on error
        const elapsedErr = Date.now() - spinnerStart;
        if (elapsedErr < MIN_SPINNER_MS) {
            await new Promise(resolve => setTimeout(resolve, MIN_SPINNER_MS - elapsedErr));
        }

        if (searchId !== currentSearchId) return;
        if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
        resultsDiv.innerHTML = '<p style="color: white; text-align: center; padding: 40px;">Error loading results. Please try again.</p>';
    } finally {
        // Re-enable input and button if this is the latest search
        if (searchId === currentSearchId) {
            if (searchButton) searchButton.disabled = false;
            if (searchInputEl) searchInputEl.disabled = false;
        }
        // Ensure overlay is removed when function finishes (guard for early returns)
        if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    }
} 
// Function to go back to search page
function goBack() {
    // Cancel any pending searches
    currentSearchId++;
    document.getElementById('searchPage').style.display = 'block';
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('searchInput').value = ''; // Clear search input
    // Clear results and re-enable input/button
    const resultsDiv = document.getElementById('resultsDiv');
    if (resultsDiv) resultsDiv.innerHTML = '';
    const searchButton = document.querySelector('#searchPage button');
    const searchInputEl = document.getElementById('searchInput');
    if (searchButton) searchButton.disabled = false;
    if (searchInputEl) searchInputEl.disabled = false;
} 