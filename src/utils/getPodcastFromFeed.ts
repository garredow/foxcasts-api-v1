import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { Podcast } from '../models';
import xml from './xml';

export async function getPodcastFromFeed(feedUrl: string): Promise<Podcast> {
  const xmlString = await fetch(feedUrl).then((res) => res.text());
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');

  // Clean up XML for faster querying below
  const episodeNodes = Array.from(xmlDoc.getElementsByTagName('item'));
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
    feedUrl: feedUrl,
    artworkUrl: podArtwork,
    categories: [],
  };

  return result;
}
