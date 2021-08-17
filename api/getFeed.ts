import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import podcastFeedParser from 'podcast-feed-parser';
import sharp from 'sharp';
import { RawEpisode, RawPodcast } from '../models';

interface Query {
  feedUrl: string;
  episodesCount?: number;
  includeArtwork?: boolean;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  // Validate query
  const query: Query = {
    feedUrl: req.query.feedUrl as string,
    episodesCount: parseInt(req.query.episodesCount as string, 10) || 30,
    includeArtwork: req.query.includeArtwork === 'true',
  };

  if (!query.feedUrl) {
    return res.status(400).json({ error: 'Missing feedUrl' });
  }

  // Perform function
  try {
    const xmlText = await fetch(query.feedUrl).then((res) => res.text());
    const data = podcastFeedParser.getPodcastFromFeed(xmlText, {
      fields: {
        meta: [
          'title',
          'author',
          'summary',
          'description',
          'categories',
          'imageURL',
        ],
        episodes: ['pubDate', 'title', 'subtitle', 'enclosure', 'duration'],
      },
    });

    const result: RawPodcast = {
      title: data.meta.title,
      author: data.meta.author,
      summary: data.meta.summary || data.meta.description,
      categories: data.meta.categories,
      artworkUrl: data.meta.imageURL,
      episodes: data.episodes.slice(0, query.episodesCount).map(
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
      ),
    };

    if (query.includeArtwork) {
      const image = await fetch(result.artworkUrl).then((res) => res.buffer());
      const [artworkSmall, artworkLarge] = await Promise.all([
        sharp(image).resize(48).toBuffer(),
        sharp(image).resize(256).toBuffer(),
      ]);

      result.artworkSmall = artworkSmall.toString('base64');
      result.artworkLarge = artworkLarge.toString('base64');
    }

    res.json(result);
  } catch (err) {
    console.error('Failed to get feed', err);
    res.status(500).send('Failed to get feed');
  }
}
