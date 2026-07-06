const YT_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export async function fetchChannelVideos( bandName)
 {
	async function searchBand(name) {
	  const response = await fetch(
		`https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(name)}&fmt=json`
	  );

	  const data = await response.json();

	  if (data.artists.length === 0) return null;

	  return data.artists[0];
	}

	async function getReleases(artistId) {
	  const response = await fetch(
		`https://musicbrainz.org/ws/2/release?artist=${artistId}&fmt=json&limit=5`
	  );

	  const data = await response.json();
	  return data.releases;
	}

	async function getTracks(releaseId) {
	  const response = await fetch(
		`https://musicbrainz.org/ws/2/release/${releaseId}?inc=recordings&fmt=json`
	  );

	  const data = await response.json();

	  const tracks = [];

	data.media?.forEach((medium) => {
		medium.tracks?.forEach((track) => {
		  tracks.push({
			id:   track.id,
			videoId: track.id,
			title: track.title,
			publishedAt: data.date ?? "Unknown",
			thumbnail: "",
			channelTitle: bandName
		  });
		});
	  });

	  return tracks;
	}

	async function loadTracks(bandName) {
	  const artist = await searchBand(bandName);

	  if (!artist) return [];

	  const releases = await getReleases(artist.id);

	  if (releases.length === 0) return [];

	  const tracks = await getTracks(releases[0].id);

	  return tracks;
	}

	const  tttt = await loadTracks(bandName);
	return tttt;
}
