// We leave all this in usually, but sometimes we want less trackin and redirects
export function cleanUrl(url: string): string {
  let cleanUrl = url;

  const megaphoneIndex = cleanUrl.indexOf('traffic.megaphone.fm');
  if (megaphoneIndex >= 0) {
    cleanUrl = `https://${url.slice(megaphoneIndex)}`;
  }

  const pdstCheck = cleanUrl.match(
    /.*pdst\.fm\/e\/chtbl\.com\/track\/[A-Za-z0-9]+\/(.*)/
  );
  if (pdstCheck?.[1]) {
    cleanUrl = `https://${pdstCheck[1]}`;
  }

  const podtracCheck = cleanUrl.match(
    /.*podtrac\.com\/[.]*redirect\.mp3\/(.+)/
  );
  if (podtracCheck?.[1]) {
    cleanUrl = `https://${podtracCheck[1]}`;
  }

  return cleanUrl;
}

// Examples for unit tests

// Vergecast
// https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/524GE/traffic.megaphone.fm/VMP2462775031.mp3?updated=1630029936

// SYSK
// https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chtbl.com/track/5899E/traffic.megaphone.fm/HSW5441879572.mp3?updated=1630000442

// ShopTalk
// https://shoptalkshow.com/podcast-download/5039/477.mp3

// The Daily
// https://dts.podtrac.com/redirect.mp3/chrt.fm/track/8DB4DB/pdst.fm/e/nyt.simplecastaudio.com/03d8b493-87fc-4bd1-931f-8a8e9b945d8a/episodes/d144ede8-8227-4cfa-990d-63e4acba2dbd/audio/128/default.mp3?aid=rss_feed&awCollectionId=03d8b493-87fc-4bd1-931f-8a8e9b945d8a&awEpisodeId=d144ede8-8227-4cfa-990d-63e4acba2dbd&feed=54nAGcIl

// TWiT
// https://pdst.fm/e/chtbl.com/track/E91833/cdn.twit.tv/audio/twit/twit0837/twit0837.mp3

// Android Central
// https://traffic.libsyn.com/secure/androidcentral/androidcentral540.mp3?dest-id=35189

// Upgrade
// https://www.podtrac.com/pts/redirect.mp3/traffic.libsyn.com/secure/upgrade/Upgrade_367.mp3

// RadioLab
// https://pdst.fm/e/www.podtrac.com/pts/redirect.mp3/audio.wnyc.org/radiolab_podcast/radiolab_podcast21theunsilencing.mp3?awCollectionId=15957&awEpisodeId=1128272

// Waveform
// https://pdst.fm/e/chtbl.com/track/8E527/traffic.megaphone.fm/STU3750120146.mp3?updated=1630019112

// Reply All
// https://traffic.megaphone.fm/GLT3824762696.mp3?updated=1629323203

// Game Informer Show
// https://feedpress.me/link/17524/14709208/566.mp3

// Darknet Diaries
// https://www.podtrac.com/pts/redirect.mp3/traffic.megaphone.fm/ADV3785322342.mp3?updated=1629070245
