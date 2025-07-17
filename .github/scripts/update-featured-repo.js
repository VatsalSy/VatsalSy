const fs = require('fs');
const https = require('https');

const GITHUB_USERNAME = 'VatsalSy';
const README_PATH = './README.md';
const EXCLUDE_REPOS = ['VatsalSy', 'VatsalSy.github.io']; // Profile repo and github.io

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GitHub Action' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getLatestRepository() {
  try {
    // Fetch recent events
    const events = await fetchData(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`);
    
    // Find unique repositories from push events
    const repoSet = new Set();
    const repoMap = new Map();
    
    for (const event of events) {
      if (event.type === 'PushEvent' && event.repo) {
        const repoName = event.repo.name;
        const repoOwner = repoName.split('/')[0];
        const repoNameOnly = repoName.split('/')[1];
        
        // Skip excluded repos and forks
        if (!EXCLUDE_REPOS.includes(repoNameOnly) && !repoSet.has(repoName)) {
          repoSet.add(repoName);
          repoMap.set(repoName, event.created_at);
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
    const repoData = await fetchData(`https://api.github.com/repos/${latestRepo}`);
    
    return {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || 'No description available',
      url: repoData.html_url,
      language: repoData.language,
      stars: repoData.stargazers_count,
      isFork: repoData.fork
    };
  } catch (error) {
    console.error('Error fetching repository:', error);
    return null;
  }
}

function updateReadme(repo) {
  try {
    let readme = fs.readFileSync(README_PATH, 'utf8');
    
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
    console.log(`Updated README with repository: ${repo.name}`);
    return true;
  } catch (error) {
    console.error('Error updating README:', error);
    return false;
  }
}

async function main() {
  console.log('Fetching latest repository...');
  const repo = await getLatestRepository();
  
  if (repo && !repo.isFork) {
    console.log(`Found repository: ${repo.name}`);
    updateReadme(repo);
  } else {
    console.log('No suitable repository found or repository is a fork');
  }
}

main();