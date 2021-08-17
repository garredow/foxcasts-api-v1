import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { handleCors } from '../utils/handleCors';

interface Query {
  artworkUrl: string;
  size?: number;
}

async function getArtwork(req: VercelRequest, res: VercelResponse) {
  // Validate query
  const query: Query = {
    artworkUrl: req.query.artworkUrl as string,
    size: parseInt(req.query.size as string, 10) || 40,
  };

  if (!query.artworkUrl) {
    return res.status(400).json({ error: 'Missing artworkUrl' });
  }

  // Perform function
  try {
    const image = await fetch(query.artworkUrl).then((res) => res.buffer());
    const artwork = await sharp(image).resize(query.size).png().toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(artwork);
  } catch (err) {
    console.error('Failed to get artwork', err);
    res.status(500).send('Failed to get artwork');
  }
}

export default handleCors(getArtwork);
