export default (string) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(string, 'text/xml');
  const rss = doc.querySelector('rss');
  const parsererror = doc.querySelector('parsererror');
  if (parsererror) {
    throw new Error('noValidRss');
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
