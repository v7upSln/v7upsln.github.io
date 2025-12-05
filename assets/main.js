

const repositories = [
    { username: "v7upSln", repo: "PSVMP", elementClass: "github-star-btn-1" },
    { username: "v7upSln", repo: "Echo", elementClass: "github-star-btn-2" },
    { username: "v7upSln", repo: "third-repo", elementClass: "github-star-btn-3" }
];

// Fetch star count for a single repository
async function fetchStarCount(username, repo) {
    const url = `https://api.github.com/repos/${username}/${repo}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.stargazers_count || 0;
}

// Update star count for a specific button
async function updateSingleStarCount(username, repo, elementClass) {
    const starBtn = document.querySelector(`.${elementClass}`);
    const starCount = starBtn?.querySelector(".star-count");
    
    if (!starBtn || !starCount) {
        console.warn(`Element not found for class: ${elementClass}`);
        return;
    }
    
    // Show loading state
    starBtn.classList.add("loading");
    
    try {
        const count = await fetchStarCount(username, repo);
        starCount.textContent = count.toLocaleString();
    } catch (error) {
        console.error(`Failed to fetch star count for ${username}/${repo}:`, error);
        starCount.textContent = "?";
        starBtn.classList.add("error");
    } finally {
        starBtn.classList.remove("loading");
    }
}

// Update all star counts
async function updateAllStarCounts() {
    // Fetch all star counts in parallel for better performance
    const promises = repositories.map(({ username, repo, elementClass }) =>
        updateSingleStarCount(username, repo, elementClass)
    );
    
    await Promise.all(promises);
}

// Alternative: Fetch total stars across all repos
async function updateTotalStarCount(totalElementClass = "total-stars") {
    const totalElement = document.querySelector(`.${totalElementClass}`);
    
    if (!totalElement) {
        console.warn(`Total element not found for class: ${totalElementClass}`);
        return;
    }
    
    totalElement.classList.add("loading");
    
    try {
        const starPromises = repositories.map(({ username, repo }) =>
            fetchStarCount(username, repo)
        );
        
        const starCounts = await Promise.all(starPromises);
        const total = starCounts.reduce((sum, count) => sum + count, 0);
        
        totalElement.textContent = `${total.toLocaleString()} stars`;
    } catch (error) {
        console.error('Failed to fetch total star count:', error);
        totalElement.textContent = "? stars";
        totalElement.classList.add("error");
    } finally {
        totalElement.classList.remove("loading");
    }
}

// Initialize on page load
updateAllStarCounts();

// Optional: Also update total if you have a total stars element
// updateTotalStarCount();