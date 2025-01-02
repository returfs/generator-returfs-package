import { execSync } from 'child_process';

export function getGitConfig(key) {
  try {
    return execSync(`git config ${key}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

export function searchCommitsForGitHubUsername() {
  try {
    const authorName = getGitConfig('user.name').toLowerCase();
    const committersRaw = execSync(
      "git log --author='@users.noreply.github.com' --pretty='%an:%ae' --reverse",
      { encoding: 'utf8' },
    );

    const committers = committersRaw
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [name, email = ''] = line.trim().split(':');
        return {
          name,
          email,
          isMatch: name.toLowerCase() === authorName && !name.includes('[bot]'),
        };
      })
      .filter(item => item.isMatch);

    if (!committers.length) {
      return '';
    }

    const [username = ''] = committers[0].email.split('@');
    return username;
  } catch {
    return '';
  }
}

export function guessGitHubUsernameUsingCli() {
  try {
    const output = execSync('gh auth status -h github.com 2>&1', {
      encoding: 'utf8',
    });
    const matches = output.match(/ogged in to github\.com as ([a-zA-Z-_]+).+/);
    return matches ? matches[1] : '';
  } catch {
    return '';
  }
}

export function guessGitHubUsername() {
  const usernameFromCommits = searchCommitsForGitHubUsername();
  if (usernameFromCommits) return usernameFromCommits;

  const usernameFromCli = guessGitHubUsernameUsingCli();
  if (usernameFromCli) return usernameFromCli;

  try {
    const remoteUrl = execSync('git config remote.origin.url', {
      encoding: 'utf8',
    }).trim();
    const remoteUrlParts = remoteUrl.replace(':', '/').split('/');
    return remoteUrlParts[1] || '';
  } catch {
    return '';
  }
}

export async function getGitHubApiEndpoint(endpoint) {
  try {
    const response = await fetch(`https://api.github.com/${endpoint}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'returfs-generator/1.0',
      },
    });

    if (response.status === 200) {
      return await response.json();
    }

    return null;
  } catch {
    return null;
  }
}

export async function guessGitHubVendorInfo(authorName, username) {
  try {
    const remoteUrl = execSync('git config remote.origin.url', {
      encoding: 'utf8',
    }).trim();

    const remoteUrlParts = remoteUrl.replace(':', '/').split('/');

    if (!remoteUrlParts[1]) {
      return [authorName, username];
    }

    const response = await getGitHubApiEndpoint(`orgs/${remoteUrlParts[1]}`);

    if (!response) {
      return [authorName, username];
    }

    return [response.name || authorName, response.login || username];
  } catch {
    return [authorName, username];
  }
}
