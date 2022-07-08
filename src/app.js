import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/ru.js';

import {
  renderFeeds,
  renderItems,
  renderModal,
  renderMessage,
  markRead,
} from './render';
import { updateRss, downloadRss } from './rss';

const validation = (url, feeds) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'duplicate',
      required: 'required',
    },
    string: {
      url: 'invalidURL',
    },
  });

  const schema = yup.object({
    url: yup.string().required().url().notOneOf(feeds),
  });

  return schema.validate(url)
    .then((data) => data)
    .catch((e) => e);
};

export default () => {
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then((t) => t);

  const state = {
    inboxUrl: '',
    feeds: [],
    items: [],
    message: '',
    isFormValid: false,
    modalId: '',
    readPosts: [],
    process: 'filling',
    messageType: '',
  };

  const form = document.querySelector('.rss-form');
  const button = form.querySelector('.btn');
  const input = form.querySelector('#url-input');

  const modalAction = (watchedState) => Array
    .from(document.querySelectorAll('button[data-bs-toggle="modal"]'))
    .map((btn) => btn.addEventListener('click', () => {
      watchedState.modalId = btn.dataset.id;
      watchedState.readPosts.push(btn.dataset.id);
      watchedState.process = 'modal';
    }));

  const watchedState = onChange(state, (path, value) => {
    switch (state.process) {
      case 'filling':
        input.removeAttribute('readonly');
        button.disabled = false;
        break;

      case 'successfully':
        renderMessage(state, form, i18nInstance);
        input.removeAttribute('readonly');
        button.disabled = false;
        renderFeeds(state.feeds, i18nInstance);
        renderItems(state.items, i18nInstance);
        modalAction(watchedState);
        break;

      case 'updated':
        renderItems(state.items, i18nInstance);
        modalAction(watchedState);
        break;

      case 'loading':
        input.setAttribute('readonly', true);
        button.disabled = true;
        break;

      case 'error':
        renderMessage(state, form, i18nInstance);
        input.removeAttribute('readonly');
        button.disabled = false;
        break;

      case 'modal':
        renderModal(state.modalId, state.items);
        markRead(state.readPosts);
        break;

      default:
        throw new Error(value);
    }
  });

  const update = () => updateRss(watchedState, state)
    .then(() => {
      setTimeout(update, 5000);
    })
    .catch((e) => console.log('Update RSS error!', e));

  update();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const url = { url: formData.get('url') };
    const feedsUrls = state.feeds.map((feed) => feed.url);

    validation(url, feedsUrls)
      .then((data) => {
        if (data.url) {
          watchedState.process = 'loading';
          downloadRss(watchedState, data.url)
            .then(() => {
              watchedState.message = 'successAdding';
              watchedState.messageType = 'success';
              watchedState.process = 'successfully';
            })
            .catch((e) => {
              watchedState.message = e.message;
              watchedState.messageType = 'error';
              watchedState.process = 'error';
            });
        } else {
          watchedState.message = data.message;
          watchedState.messageType = 'error';
          watchedState.process = 'error';
        }
      });
  });
};
