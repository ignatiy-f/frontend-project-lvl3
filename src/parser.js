export default (string) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(string, 'text/xml');
  const rss = doc.querySelector('rss');
  if (!rss) {
    console.log('boom');
    throw new Error('parseError');
  }

  const channelTitle = rss.querySelector('channel title').textContent;
  const channelDescription = rss.querySelector('channel description').textContent;
  const channelItems = rss.querySelectorAll('channel item');

  const parsedItems = Array.from(channelItems).map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    return { title, link, description };
  });

  return { channelTitle, channelDescription, items: parsedItems };
};
