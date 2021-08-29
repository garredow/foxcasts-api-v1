import { Chapter } from '../models';

export function tryParseChapters(id3Obj: any): Chapter[] {
  const chapters: any[] = id3Obj?.tags?.CHAP;
  if (!chapters || chapters.length === 0) {
    return [];
  }

  try {
    return chapters.map((chapter: any) => ({
      title: chapter.data.subFrames.TIT2.data,
      startTime: chapter.data.startTime,
      endTime: chapter.data.endTime,
    }));
  } catch (err) {
    console.error('Failed to get chapters', err);
  }

  // It's ok if this fails, just return no chapters
  return [];
}

// ID3 Chapter Example
// {
//     "id": "CHAP",
//     "size": 42,
//     "description": "Chapter",
//     "data": {
//         "id": "chp0",
//         "startTime": 0,
//         "endTime": 525672,
//         "startOffset": 0,
//         "endOffset": 4205504,
//         "subFrames": {
//             "TIT2": {
//                 "id": "TIT2",
//                 "size": 11,
//                 "description": "Title/songname/content description",
//                 "data": "News"
//             }
//         }
//     }
// },
