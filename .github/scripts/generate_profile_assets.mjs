import fs from 'node:fs/promises';

const USER = process.env.PROFILE_USER || 'Himeshbror18';
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error('GITHUB_TOKEN is required');

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'HB-profile-assets'
};

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, { headers, ...options });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res.json();
}

const user = await gh(`/users/${USER}`);
const repos = await gh(`/users/${USER}/repos?per_page=100&type=owner&sort=updated`);

let stars = 0;
let forks = 0;
let openIssues = 0;
const languageTotals = {};
for (const repo of repos) {
  stars += repo.stargazers_count || 0;
  forks += repo.forks_count || 0;
  openIssues += repo.open_issues_count || 0;
  try {
    const langs = await gh(`/repos/${repo.full_name}/languages`);
    for (const [lang, bytes] of Object.entries(langs)) languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
  } catch {
    // Keep generation resilient if one repository's language endpoint fails.
  }
}

let contributions = 0;
try {
  const q = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}`;
  const gql = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers: {...headers, 'Content-Type':'application/json'},
    body: JSON.stringify({query:q, variables:{login:USER}})
  });
  const data = await gql.json();
  contributions = data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;
} catch {}

const topLangs = Object.entries(languageTotals).sort((a,b)=>b[1]-a[1]).slice(0,6);
const totalLangBytes = topLangs.reduce((s,[,v])=>s+v,0) || 1;

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
const out = 'assets';
await fs.mkdir(out,{recursive:true});

const bg = '#0b0a13', panel = '#121020', line = '#2a2542', text = '#ece9ff', muted='#9f9ab8', purple='#a78bfa', cyan='#67e8f9', pink='#f0abfc';

function card(title, subtitle, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${purple}"/><stop offset="1" stop-color="${cyan}"/></linearGradient></defs><rect width="1000" height="300" rx="24" fill="${bg}"/><rect x="1" y="1" width="998" height="298" rx="23" fill="${panel}" stroke="${line}"/><path d="M38 245H962" stroke="${line}"/><rect x="38" y="36" width="7" height="54" rx="3" fill="url(#g)"/><text x="62" y="58" fill="${muted}" font-family="ui-monospace,monospace" font-size="15" letter-spacing="3">${esc(title)}</text><text x="62" y="85" fill="${text}" font-family="ui-sans-serif,system-ui" font-size="22" font-weight="700">${esc(subtitle)}</text>${body}</svg>`;
}

const statBody = `<g font-family="ui-sans-serif,system-ui"><g><text x="70" y="145" fill="${muted}" font-size="14">CONTRIBUTIONS / 1 YEAR</text><text x="70" y="184" fill="${text}" font-size="34" font-weight="800">${fmt(contributions)}</text></g><g><text x="330" y="145" fill="${muted}" font-size="14">PUBLIC REPOS</text><text x="330" y="184" fill="${text}" font-size="34" font-weight="800">${fmt(user.public_repos)}</text></g><g><text x="560" y="145" fill="${muted}" font-size="14">STARS RECEIVED</text><text x="560" y="184" fill="${text}" font-size="34" font-weight="800">${fmt(stars)}</text></g><g><text x="770" y="145" fill="${muted}" font-size="14">FOLLOWERS</text><text x="770" y="184" fill="${text}" font-size="34" font-weight="800">${fmt(user.followers)}</text></g><text x="62" y="270" fill="${muted}" font-family="ui-monospace,monospace" font-size="13">DATA: GitHub API • generated automatically</text></g>`;
await fs.writeFile(`${out}/profile-stats.svg`, card('SYSTEM // STATS','HB — activity snapshot', statBody));

let x=70;
const bars = topLangs.map(([lang,bytes],i)=>{
  const pct = bytes/totalLangBytes;
  const w = Math.max(40, 720*pct);
  const colors=[purple,cyan,pink,'#f9a8d4','#a7f3d0','#fde68a'];
  const y=124+i*27;
  const row=`<text x="70" y="${y}" fill="${text}" font-size="14">${esc(lang)}</text><rect x="195" y="${y-12}" width="720" height="12" rx="6" fill="#242039"/><rect x="195" y="${y-12}" width="${w.toFixed(1)}" height="12" rx="6" fill="${colors[i%colors.length]}"/><text x="935" y="${y}" text-anchor="end" fill="${muted}" font-size="12">${(pct*100).toFixed(1)}%</text>`;
  return row;
}).join('');
await fs.writeFile(`${out}/profile-languages.svg`, card('SYSTEM // LANGUAGE MAP','What the repositories are actually written in', `<g font-family="ui-sans-serif,system-ui">${bars || `<text x="70" y="150" fill="${muted}" font-size="15">No language data yet.</text>`}<text x="62" y="270" fill="${muted}" font-family="ui-monospace,monospace" font-size="13">calculated from owned repositories</text></g>`));

const trophyData = [
  ['PROJECTS', user.public_repos, 'public repositories'],
  ['STARS', stars, 'stars received'],
  ['FOLLOWERS', user.followers, 'people following'],
  ['CONTRIBUTIONS', contributions, 'contributions / 1 year'],
  ['FORKS', forks, 'forks received'],
  ['ISSUES', openIssues, 'open issues across repos']
];
const trophyCards = trophyData.map(([name,value,sub],i)=>{
  const cx=70+(i%3)*300, cy=118+Math.floor(i/3)*74;
  return `<g transform="translate(${cx} ${cy})"><circle cx="22" cy="0" r="21" fill="#17142a" stroke="${i<2?cyan:purple}"/><text x="22" y="6" text-anchor="middle" fill="${text}" font-size="20">${['✦','✧','◆','◇','★','⬢'][i]}</text><text x="58" y="-4" fill="${text}" font-size="15" font-weight="700">${esc(name)}</text><text x="58" y="17" fill="${muted}" font-size="13">${fmt(value)} · ${esc(sub)}</text></g>`;
}).join('');
await fs.writeFile(`${out}/profile-trophies.svg`, card('ACHIEVEMENT // TROPHY BOARD','GitHub activity, rendered locally', `<g font-family="ui-sans-serif,system-ui">${trophyCards}</g>`));

console.log(JSON.stringify({repos:user.public_repos, stars, followers:user.followers, contributions, languages:topLangs.map(([k])=>k)},null,2));
