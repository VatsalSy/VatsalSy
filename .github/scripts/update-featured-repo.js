const fs = require('node:fs');
const https = require('node:https');

const GITHUB_USERNAME = 'VatsalSy';
const README_PATH = './README.md';
const EXCLUDE_REPOS = ['VatsalSy', 'VatsalSy.github.io']; // Profile repo and github.io
const FALLBACK_ORG = 'comphy-lab';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
// Meta line separator — never hand-edit the README latest-repo block.
const META_SEPARATOR = ' · ';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second initial delay
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hasUsableDescription(description) {
  return typeof description === 'string' && description.trim().length > 0;
}

function isExcludedRepo(repoFullName) {
  const repoNameOnly = repoFullName.split('/')[1];
  return EXCLUDE_REPOS.includes(repoNameOnly);
}

function toFeaturedRepo(repoData) {
  return {
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description.trim(),
    url: repoData.html_url,
    language: repoData.language,
    stars: repoData.stargazers_count,
    owner: repoData.owner.login,
    isFork: repoData.fork,
    pushedAt: repoData.pushed_at
  };
}

function isFeatureWorthy(repoData) {
  if (!repoData || repoData.fork || repoData.private) {
    return false;
  }
  if (isExcludedRepo(repoData.full_name)) {
    return false;
  }
  return hasUsableDescription(repoData.description);
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

async function fetchRepoIfFeatureWorthy(repoFullName) {
  try {
    console.log(`Checking repository: ${repoFullName}`);
    const repoData = await fetchWithRetry(`https://api.github.com/repos/${repoFullName}`);

    if (!isFeatureWorthy(repoData)) {
      const reason = repoData.fork
        ? 'fork'
        : repoData.private
          ? 'private'
          : isExcludedRepo(repoData.full_name)
            ? 'excluded'
            : 'empty description';
      console.log(`Skipping ${repoFullName}: ${reason}`);
      return null;
    }

    return toFeaturedRepo(repoData);
  } catch (error) {
    console.error(`Error checking repository ${repoFullName}:`, error.message);
    return null;
  }
}

async function getLatestFromPushEvents() {
  console.log('Fetching recent push events...');
  const events = await fetchWithRetry(
    `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`
  );

  if (!Array.isArray(events)) {
    throw new Error('Invalid response from GitHub API');
  }

  // Events are newest-first; keep first-seen order as push recency.
  const seen = new Set();

  for (const event of events) {
    if (event.type !== 'PushEvent' || !event.repo) {
      continue;
    }

    const repoName = event.repo.name;
    if (seen.has(repoName) || isExcludedRepo(repoName)) {
      continue;
    }
    seen.add(repoName);

    const featured = await fetchRepoIfFeatureWorthy(repoName);
    if (featured) {
      console.log(`Selected from recent pushes: ${featured.fullName}`);
      return featured;
    }
  }

  console.log('No feature-worthy repository found in recent push events');
  return null;
}

async function getLatestFromRepoLists() {
  console.log('Falling back to recently pushed public repositories...');
  const listUrls = [
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&direction=desc&per_page=30&type=owner`,
    `https://api.github.com/orgs/${FALLBACK_ORG}/repos?sort=pushed&direction=desc&per_page=30&type=public`
  ];

  const byFullName = new Map();

  for (const url of listUrls) {
    try {
      const repos = await fetchWithRetry(url);
      if (!Array.isArray(repos)) {
        continue;
      }
      for (const repo of repos) {
        if (!repo?.full_name || byFullName.has(repo.full_name)) {
          continue;
        }
        byFullName.set(repo.full_name, repo);
      }
    } catch (error) {
      console.error(`Error fetching repository list (${url}):`, error.message);
    }
  }

  const ranked = [...byFullName.values()]
    .filter(isFeatureWorthy)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  if (ranked.length === 0) {
    console.log('No feature-worthy repository found in repository lists');
    return null;
  }

  const featured = toFeaturedRepo(ranked[0]);
  console.log(`Selected from repository lists: ${featured.fullName}`);
  return featured;
}

async function getLatestRepository() {
  // Primary: most recently pushed public non-fork with a real description.
  // Verified: prior logic picked the newest PushEvent regardless of description,
  // which surfaced comphy-lab/CoMPhy-Lab-Blogs as "No description available".
  let fromEvents = null;
  try {
    fromEvents = await getLatestFromPushEvents();
  } catch (error) {
    console.error('Push-events lookup failed; trying repository lists:', error.message);
    if (error.body) {
      console.error('Response body:', error.body);
    }
  }

  if (fromEvents) {
    return fromEvents;
  }

  try {
    return await getLatestFromRepoLists();
  } catch (error) {
    console.error('Error fetching repository lists:', error.message);
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
    
    const meta = [
      repo.description,
      repo.language || null,
      repo.stars > 0 ? `⭐ ${repo.stars}` : null,
    ].filter(Boolean).join(META_SEPARATOR);

    const newContent = `${startMarker}

### [${repo.name}](${repo.url})

${meta}

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
    console.log('No suitable repository found; leaving README featured block unchanged');
  }
}

module.exports = {
  hasUsableDescription,
  isExcludedRepo,
  isFeatureWorthy,
  META_SEPARATOR,
  EXCLUDE_REPOS
};

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
