import { RawEpisode } from '../models';
import { DOMParser } from 'xmldom';
import { getText } from './getText';
import { getAttribute } from './getAttribute';
import { getDurationInSeconds } from './getDurationInSeconds';

interface Options {
  episodeLimit?: number;
  afterDate?: string; // ISO 8601
  includeDescription?: boolean;
}

export function getEpisodes(
  xmlString: string,
  { episodeLimit = 50, includeDescription = false, ...options }: Options
): RawEpisode[] {
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');

  if (episodeLimit === 0) {
    return [];
  }

  let episodes: RawEpisode[] = [];

  let episodeNodes = Array.from(xmlDoc.getElementsByTagName('item')).slice(
    0,
    episodeLimit
  );
  for (let i = 0; i < episodeNodes.length; i++) {
    const date = new Date(
      getText(episodeNodes[i], 'pubDate') || ''
    ).toISOString();

    if (options.afterDate && options.afterDate > date) {
      break;
    }

    try {
      episodes.push({
        guid: episodeNodes[i].getElementsByTagName('guid')[0].textContent,
        title: getText(episodeNodes[i], 'itunes:title', 'title'),
        subtitle: getText(episodeNodes[i], 'itunes:subtitle', 'subtitle'),
        date,
        duration: getDurationInSeconds(
          getText(episodeNodes[i], 'itunes:duration', 'duration') || ''
        ),
        fileSize: parseInt(
          getAttribute(episodeNodes[i], 'enclosure', 'length') || '',
          10
        ),
        fileType: getAttribute(episodeNodes[i], 'enclosure', 'type'),
        fileUrl: getAttribute(episodeNodes[i], 'enclosure', 'url'),
        description: includeDescription
          ? getText(episodeNodes[i], 'itunes:description', 'description') ||
            undefined
          : undefined,
      } as RawEpisode);
    } catch (err) {
      console.log('Error parsing episode', err, episodeNodes[i]);
    }
  }

  return episodes;
}
