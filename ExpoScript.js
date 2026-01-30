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
// Function to create HTML for result items
function createResultHTML(products) {
    let html = '';
    products.forEach(product => {
        html += `
            <div class="resultItem" data-link="${product.link}" style="cursor: pointer;">
                <h3>${product.name}</h3>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Store:</strong> ${product.store}</p>
                <p><strong>Availability:</strong> ${product.availability}</p>
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
    const searchInput = document.getElementById('searchInput').value.trim();
    
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
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchInput })
        });
        
        const data = await response.json();
        
        if (data.success && data.results.length > 0) {
            resultsDiv.innerHTML = createResultHTML(data.results);

            document.querySelectorAll('.resultItem').forEach(item => {
                item.addEventListener('click', function() {
                    const link = this.getAttribute('data-link');
                    openProductLink(link);
                });
            });
        } else {
            resultsDiv.innerHTML = '<p style="color: white; text-align: center; padding: 40px;">No products found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<p style="color: white; text-align: center; padding: 40px;">Error loading results. Please try again.</p>';
    }
}
// Function to go back to search page
function goBack() {
    document.getElementById('searchPage').style.display = 'block';
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('searchInput').value = ''; // Clear search input
}