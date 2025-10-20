const YT_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export async function fetchChannelVideos(
  channelId,
  { pageToken = '', pageSize = 6 } = {}
) {
  if (!YT_KEY) throw new Error('Missing VITE_GOOGLE_API_KEY');
  console.log('YT_KEY', YT_KEY);
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    key: YT_KEY,
    maxResults: String(pageSize),
    type: 'video',
    order: 'date',
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  );
  if (!res.ok) throw new Error(`YouTube API failed: ${res.status}`);
  const data = await res.json();

  const items = (data.items || []).map((i) => {
    const vid = i.id?.videoId || '';
    const s = i.snippet || {};
    return {
      id: vid,
      videoId: vid,
      title: s.title || 'Untitled',
      publishedAt: s.publishedAt || null,
      thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '',
      channelTitle: s.channelTitle || '',
    };
  });

  const totalResults = data.pageInfo?.totalResults ?? 0;
  return {
    items,
    nextPageToken: data.nextPageToken || '',
    prevPageToken: data.prevPageToken || '',
    totalResults,
  };
}
