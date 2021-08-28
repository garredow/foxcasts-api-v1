import { Episode } from '../models';
import { DOMParser } from 'xmldom';
import { getDurationInSeconds } from './getDurationInSeconds';
import xml from './xml';

interface Options {
  episodeLimit?: number;
  since?: string; // ISO 8601
  includeDescription?: boolean;
}

export function getEpisodesFromFeed(
  xmlString: string,
  { episodeLimit = 50, includeDescription = false, ...options }: Options
): Episode[] {
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');

  if (episodeLimit === 0) {
    return [];
  }

  let episodes: Episode[] = [];

  let episodeNodes = Array.from(xmlDoc.getElementsByTagName('item')).slice(
    0,
    episodeLimit
  );
  for (let i = 0; i < episodeNodes.length; i++) {
    const date = new Date(
      xml.getText(episodeNodes[i], 'pubDate') || ''
    ).toISOString();

    if (options.since && options.since >= date) {
      break;
    }

    try {
      episodes.push({
        date,
        title: xml.getText(episodeNodes[i], 'itunes:title', 'title') || '',
        description: includeDescription
          ? xml.getText(episodeNodes[i], 'itunes:description', 'description') ||
            undefined
          : undefined,
        duration: getDurationInSeconds(
          xml.getText(episodeNodes[i], 'itunes:duration', 'duration') || ''
        ),
        fileSize: parseInt(
          xml.getAttribute(episodeNodes[i], 'enclosure', 'length') || '',
          10
        ),
        fileType: xml.getAttribute(episodeNodes[i], 'enclosure', 'type') || '',
        fileUrl: xml.getAttribute(episodeNodes[i], 'enclosure', 'url') || '',
      });
    } catch (err) {
      console.log('Error parsing episode', err, episodeNodes[i]);
    }
  }

  return episodes;
}
