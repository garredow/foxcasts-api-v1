import { Episode, Podcast } from '../models';
import { DOMParser } from 'xmldom';
import { getDurationInSeconds } from './getDurationInSeconds';
import xml from './xml';

interface Options {
  episodeLimit?: number;
  includeDescription?: boolean;
}

export function getPodcastFromFeed(
  xmlString: string,
  { episodeLimit = 50, includeDescription = false }: Options
): Podcast {
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');

  let episodes: Episode[] = [];
  const episodeNodes = Array.from(xmlDoc.getElementsByTagName('item'));
  if (episodeLimit > 0) {
    episodeNodes.slice(0, episodeLimit).forEach((epNode) => {
      try {
        episodes.push({
          date: new Date(xml.getText(epNode, 'pubDate') || '').toISOString(),
          title: xml.getText(epNode, 'itunes:title', 'title') || '',
          description: includeDescription
            ? xml.getText(epNode, 'itunes:description', 'description') ||
              undefined
            : undefined,
          duration: getDurationInSeconds(
            xml.getText(epNode, 'itunes:duration', 'duration') || ''
          ),
          fileSize: parseInt(
            xml.getAttribute(epNode, 'enclosure', 'length') || '',
            10
          ),
          fileType: xml.getAttribute(epNode, 'enclosure', 'type') || '',
          fileUrl: xml.getAttribute(epNode, 'enclosure', 'url') || '',
        });
      } catch (err) {
        console.log('Error parsing episode', err, epNode);
      }
    });

    // Clean up XML for faster querying below
  }
  episodeNodes.forEach((epNode) => xmlDoc.removeChild(epNode));

  const podTitle = xml.getText(xmlDoc, 'title');
  const podAuthor = xml.getText(xmlDoc, 'itunes:author');
  const podArtwork =
    xml.getAttribute(xmlDoc, 'itunes:image', 'href') ||
    xml.getText(xmlDoc, 'url');
  const podSummary = xml.getText(xmlDoc, 'itunes:summary', 'description');

  if (!podTitle || !podAuthor || !podArtwork) {
    throw new Error('Missing podcast info');
  }

  const result: Podcast = {
    title: podTitle,
    author: podAuthor,
    description: podSummary || '',
    artworkUrl: podArtwork,
    episodes,
    categories: [],
  };

  return result;
}
