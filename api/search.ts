import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { ITunesPodcast, SearchResult } from '../models';

interface Query {
  searchText: string;
  resultsCount?: number;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  // Validate query
  const query: Query = {
    searchText: req.query.searchText as string,
    resultsCount: parseInt(req.query.resultsCount as string, 10) || 10,
  };

  if (!query.searchText) {
    return res.status(400).json({ error: 'Missing searchText' });
  }

  // Perform function
  try {
    const data = await fetch(
      `https://itunes.apple.com/search?media=podcast&term=${query.searchText}`
    ).then((res) => res.json());

    const result: SearchResult[] = (data.results as ITunesPodcast[])
      .slice(0, query.resultsCount)
      .map((podcast) => ({
        title: podcast.collectionName,
        author: podcast.artistName,
        itunesId: podcast.collectionId,
        feedUrl: podcast.feedUrl,
        artworkUrl: podcast.artworkUrl100,
      }));

    res.status(200).json(result);
  } catch (err) {
    console.error('Failed to search', err);
    res.status(500).send('Failed to search');
  }
}
