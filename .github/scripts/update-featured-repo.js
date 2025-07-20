const fs = require('node:fs');
const https = require('node:https');

const GITHUB_USERNAME = 'VatsalSy';
const README_PATH = './README.md';
const EXCLUDE_REPOS = ['VatsalSy', 'VatsalSy.github.io']; // Profile repo and github.io
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second initial delay
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  const headers = {
    'User-Agent': 'GitHub Action'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await fetchData(url, headers);
      return data;
    } catch (error) {
      if (error.statusCode === 403 && error.headers && error.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = Number.parseInt(error.headers['x-ratelimit-reset']) * 1000;
        const waitTime = Math.max(resetTime - Date.now(), 0) + 1000; // Add 1 second buffer
        console.log(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await sleep(waitTime);
      } else if (error.statusCode === 429 || (error.statusCode >= 500 && attempt < retries)) {
        const delay = RATE_LIMIT_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.log(`Request failed with status ${error.statusCode}. Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed after ${retries} retries`);
}

function fetchData(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
          error.statusCode = res.statusCode;
          error.headers = res.headers;
          error.body = data;
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function isValidRepository(repoFullName) {
  try {
    const repoData = await fetchWithRetry(`https://api.github.com/repos/${repoFullName}`);
    
    // Check if it's a fork
    if (repoData.fork) {
      console.log(`Skipping ${repoFullName}: Repository is a fork`);
      return false;
    }
    
    // Check if the user has push access (owner or collaborator)
    const [owner, repoName] = repoFullName.split('/');
    
    // Include repos owned by the user
    if (owner === GITHUB_USERNAME) {
      return true;
    }
    
    // Include organization repos where user has push access
    // The events API only shows repos where the user has push access
    return true;
  } catch (error) {
    console.error(`Error checking repository ${repoFullName}:`, error.message);
    return false;
  }
}

async function getLatestRepository() {
  try {
    console.log('Fetching recent events...');
    const events = await fetchWithRetry(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`);
    
    if (!Array.isArray(events)) {
      throw new Error('Invalid response from GitHub API');
    }
    
    // Find unique repositories from push events
    const repoSet = new Set();
    const repoMap = new Map();
    
    for (const event of events) {
      if (event.type === 'PushEvent' && event.repo) {
        const repoName = event.repo.name;
        const repoNameOnly = repoName.split('/')[1];
        
        // Skip excluded repos
        if (!EXCLUDE_REPOS.includes(repoNameOnly) && !repoSet.has(repoName)) {
          // Validate repository (check if it's not a fork)
          console.log(`Checking repository: ${repoName}`);
          const isValid = await isValidRepository(repoName);
          
          if (isValid) {
            repoSet.add(repoName);
            repoMap.set(repoName, event.created_at);
          }
        }
      }
    }
    
    // Get the most recent repo
    let latestRepo = null;
    let latestDate = null;
    
    for (const [repo, date] of repoMap) {
      if (!latestDate || new Date(date) > new Date(latestDate)) {
        latestRepo = repo;
        latestDate = date;
      }
    }
    
    if (!latestRepo) {
      console.log('No recent repository found');
      return null;
    }
    
    // Fetch repository details
    console.log(`Fetching details for: ${latestRepo}`);
    const repoData = await fetchWithRetry(`https://api.github.com/repos/${latestRepo}`);
    
    return {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || 'No description available',
      url: repoData.html_url,
      language: repoData.language,
      stars: repoData.stargazers_count,
      owner: repoData.owner.login,
      isFork: repoData.fork
    };
  } catch (error) {
    console.error('Error fetching repository:', error.message);
    if (error.body) {
      console.error('Response body:', error.body);
    }
    return null;
  }
}

function updateReadme(repo) {
  try {
    const readme = fs.readFileSync(README_PATH, 'utf8');
    
    const startMarker = '<!--START_SECTION:latest-repo-->';
    const endMarker = '<!--END_SECTION:latest-repo-->';
    
    const startIndex = readme.indexOf(startMarker);
    const endIndex = readme.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('Section markers not found in README');
      return false;
    }
    
    const newContent = `${startMarker}

### [${repo.name}](${repo.url})

${repo.description}${repo.language ? ` • ${repo.language}` : ''}${repo.stars > 0 ? ` ⭐ ${repo.stars}` : ''}

${endMarker}`;
    
    const updatedReadme = readme.substring(0, startIndex) + 
                         newContent + 
                         readme.substring(endIndex + endMarker.length);
    
    fs.writeFileSync(README_PATH, updatedReadme);
    console.log(`Updated README with repository: ${repo.name} (owner: ${repo.owner})`);
    return true;
  } catch (error) {
    console.error('Error updating README:', error);
    return false;
  }
}

async function main() {
  console.log('Starting featured repository update...');
  console.log(`GitHub Token: ${GITHUB_TOKEN ? 'Present' : 'Not found (using unauthenticated requests)'}`);
  
  const repo = await getLatestRepository();
  
  if (repo) {
    console.log(`Found repository: ${repo.name} (${repo.fullName})`);
    updateReadme(repo);
  } else {
    console.log('No suitable repository found');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});