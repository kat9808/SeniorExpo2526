// Set random background on page load
window.addEventListener('DOMContentLoaded', function() {
    const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7'];
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.classList.add(randomBg);
});

// Function to handle search button click
function handleSearch() {
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
    
    // Clear previous results
    const resultsDiv = document.getElementById('resultsDiv');
    resultsDiv.innerHTML = '';
    
    // TODO: Add actual search functionality here
    // This will call your Search.py backend to get results
    resultsDiv.innerHTML = '<p>Searching for: ' + searchInput + '</p>';
}

// Function to go back to search page
function goBack() {
    document.getElementById('searchPage').style.display = 'block';
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('searchInput').value = ''; // Clear search input
    document.getElementById('resultsDiv').innerHTML = ''; // Clear results
}