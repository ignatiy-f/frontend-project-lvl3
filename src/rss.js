import axios from 'axios';
import { differenceWith, isEqual, uniqueId } from 'lodash';
import domParser from './parser';

const proxifyURL = (urlIn) => {
  const result = new URL('https://allorigins.hexlet.app/get');
  result.searchParams.set('disableCache', 'true');
  result.searchParams.set('url', urlIn);
  return result.href;
};

const downloadRss = (watchedState, url) => axios
  .get(proxifyURL(url))
  .then((response) => {
    const data = domParser(response.data.contents);
    const feedId = uniqueId();

    watchedState.feeds.push({
      id: feedId,
      title: data.channelTitle,
      description: data.channelDescription,
      url,
    });

    const feedItems = data.items.map((item) => ({
      id: uniqueId(),
      feedId,
      ...item,
    }));

    watchedState.items.unshift(...feedItems);
  })
  .catch((e) => {
    throw e;
  });

const updateRss = (watchedState) => {
  const promises = watchedState.feeds.reverse().map((feed) => axios
    .get(proxifyURL(feed.url))
    .then((response) => {
      const data = domParser(response.data.contents);

      const feedItems = data.items.map((item) => ({
        id: uniqueId(),
        feedId: feed.id,
        ...item,
      }));

      const oldItemsLinks = watchedState.items
        .filter((item) => item.feedId === feed.id)
        .map(({ link }) => link);

      const newItemsLinks = feedItems.map(({ link }) => link);
      const differentItemsLinks = differenceWith(newItemsLinks, oldItemsLinks, isEqual);
      const differentItems = feedItems.filter(({ link }) => differentItemsLinks.includes(link));

      if (differentItems.length > 0) {
        watchedState.items.unshift(...differentItems);
        watchedState.form.process = 'updated';
      }
    })
    .catch((e) => e));
  return Promise.all(promises);
};

export { downloadRss, updateRss };
