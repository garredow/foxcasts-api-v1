import { RawEpisode, RawPodcast } from '../models';
import { DOMParser } from 'xmldom';
import { getText } from './getText';
import { getAttribute } from './getAttribute';
import { getDurationInSeconds } from './getDurationInSeconds';

interface Options {
  episodeLimit?: number;
  includeDescription?: boolean;
}

export function getPodcast(
  xmlString: string,
  { episodeLimit = 50, includeDescription = false }: Options
): RawPodcast {
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');

  let episodes: RawEpisode[] = [];
  if (episodeLimit > 0) {
    const episodeNodes = Array.from(xmlDoc.getElementsByTagName('item'));

    episodeNodes.slice(0, episodeLimit).forEach((epNode) => {
      try {
        const episode: RawEpisode = {
          guid: epNode.getElementsByTagName('guid')[0].textContent,
          title: getText(epNode, 'itunes:title', 'title'),
          subtitle: getText(epNode, 'itunes:subtitle', 'subtitle'),
          date: new Date(getText(epNode, 'pubDate') || '').toISOString(),
          duration: getDurationInSeconds(
            getText(epNode, 'itunes:duration', 'duration') || ''
          ),
          fileSize: parseInt(
            getAttribute(epNode, 'enclosure', 'length') || '',
            10
          ),
          fileType: getAttribute(epNode, 'enclosure', 'type'),
          fileUrl: getAttribute(epNode, 'enclosure', 'url'),
        } as RawEpisode;

        if (includeDescription) {
          episode.description =
            getText(epNode, 'itunes:description', 'description') || undefined;
        }

        episodes.push(episode);
      } catch (err) {
        console.log('Error parsing episode', err, epNode);
      }
    });

    // Clean up XML for faster querying below
    episodeNodes.forEach((epNode) => xmlDoc.removeChild(epNode));
  }
  const podTitle = getText(xmlDoc, 'title');
  const podAuthor = getText(xmlDoc, 'itunes:author');
  const podArtwork =
    getAttribute(xmlDoc, 'itunes:image', 'href') || getText(xmlDoc, 'url');
  const podSummary = getText(xmlDoc, 'itunes:summary', 'description');

  if (!podTitle || !podAuthor || !podArtwork) {
    throw new Error('Missing podcast info');
  }

  const result: RawPodcast = {
    title: podTitle,
    author: podAuthor,
    summary: podSummary || '',
    artworkUrl: podArtwork,
    episodes,
  };

  return result;
}
