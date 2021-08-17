import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import podcastFeedParser from 'podcast-feed-parser';
import { RawEpisode } from '../models';
import { handleCors } from '../utils/handleCors';

interface Query {
  feedUrl: string;
  afterDate: string;
}

async function getNewEpisodes(req: VercelRequest, res: VercelResponse) {
  // Validate query
  const query: Query = {
    feedUrl: req.query.feedUrl as string,
    afterDate: req.query.afterDate as string,
  };

  if (!query.feedUrl || !query.afterDate) {
    return res.status(400).json({ error: 'Missing feedUrl or afterDate' });
  }

  // Perform function
  try {
    const xmlText = await fetch(query.feedUrl).then((res) => res.text());
    const data = podcastFeedParser.getPodcastFromFeed(xmlText, {
      fields: {
        episodes: ['pubDate', 'title', 'subtitle', 'enclosure', 'duration'],
      },
    });

    const result: RawEpisode[] = data.episodes
      .filter((ep) => ep.pubDate > query.afterDate)
      .map(
        (ep: any) =>
          ({
            date: ep.pubDate,
            title: ep.title,
            subtitle: ep.subtitle,
            duration: ep.duration,
            fileSize: ep.enclosure.length,
            fileType: ep.enclosure.type,
            fileUrl: ep.enclosure.url,
          } as RawEpisode)
      );

    res.json(result);
  } catch (err) {
    console.error('Failed to get episodes', err);
    res.status(500).send('Failed to get episodes');
  }
}

export default handleCors(getNewEpisodes);
