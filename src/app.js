import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/ru.js';
import {
  renderFeeds,
} from './render';

const validation = (url, feeds) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'duplicate',
      required: 'required',
    },
    string: {
      url: 'validationError',
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

  const watchedState = onChange(state, (path, value) => {
    switch (state.process) {
      case 'filling':
        input.removeAttribute('readonly');
        button.disabled = false;
        break;

      case 'successfully':
        //renderMessage(state, form, i18nInstance);

        input.removeAttribute('readonly');
        button.disabled = false;

        renderFeeds(state.feeds, i18nInstance);
        //renderItems(state.items, i18nInstance);
        //modalAction(watchedState);
        break;

      case 'updated':
        //renderItems(state.items, i18nInstance);
        //modalAction(watchedState);
        break;

      case 'loading':
        input.setAttribute('readonly', true);
        button.disabled = true;
        break;

      case 'error':
        //renderMessage(state, form, i18nInstance);
        input.removeAttribute('readonly');
        button.disabled = false;
        break;

      case 'modal':
        //renderModal(state.modalId, state.items);
        //markRead(state.readPosts);
        break;

      default:
        throw new Error(value);
    }
  });
};
