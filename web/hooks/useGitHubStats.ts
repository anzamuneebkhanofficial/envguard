'use client';

import { useState, useEffect } from 'react';

interface GitHubStats {
  stars: number | null;
  forks: number | null;
  isLoading: boolean;
  isUnavailable: boolean;
  repoUrl: string;
}

const CACHE_KEY = 'envguard_gh_stats';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache to preserve rate limits

export function useGitHubStats(customRepo?: string): GitHubStats {
  const repo = customRepo || process.env.NEXT_PUBLIC_GITHUB_REPO || '';
  const repoUrl = repo ? `https://github.com/${repo}` : 'https://github.com';

  const [stats, setStats] = useState<{
    stars: number | null;
    forks: number | null;
    isLoading: boolean;
    isUnavailable: boolean;
  }>({
    stars: null,
    forks: null,
    isLoading: !!repo,
    isUnavailable: !repo,
  });

  useEffect(() => {
    if (!repo) {
      setStats({
        stars: null,
        forks: null,
        isLoading: false,
        isUnavailable: true,
      });
      return;
    }

    // Check session cache first
    try {
      const cached = sessionStorage.getItem(`${CACHE_KEY}_${repo}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          setStats({
            stars: typeof parsed.stars === 'number' ? parsed.stars : null,
            forks: typeof parsed.forks === 'number' ? parsed.forks : null,
            isLoading: false,
            isUnavailable: false,
          });
          return;
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    let isSubscribed = true;

    async function fetchStats() {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!res.ok) {
          if (isSubscribed) {
            setStats({
              stars: null,
              forks: null,
              isLoading: false,
              isUnavailable: true,
            });
          }
          return;
        }

        const data = await res.json();
        const stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
        const forks = typeof data.forks_count === 'number' ? data.forks_count : null;

        if (isSubscribed) {
          setStats({
            stars,
            forks,
            isLoading: false,
            isUnavailable: false,
          });
        }

        try {
          sessionStorage.setItem(
            `${CACHE_KEY}_${repo}`,
            JSON.stringify({ stars, forks, timestamp: Date.now() })
          );
        } catch {
          // Ignore storage quota
        }
      } catch {
        if (isSubscribed) {
          setStats({
            stars: null,
            forks: null,
            isLoading: false,
            isUnavailable: true,
          });
        }
      }
    }

    fetchStats();

    return () => {
      isSubscribed = false;
    };
  }, [repo]);

  return {
    ...stats,
    repoUrl,
  };
}

export function formatNumberCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}
