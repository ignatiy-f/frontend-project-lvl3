import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/ru.js';
import initView from './watcher';
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
    feeds: [],
    items: [],
    form: {
      message: '',
      modalId: '',
      readPosts: [],
      process: 'filling',
      messageType: '',
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    button: document.getElementById('btn-submit'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = initView(state, elements, i18nInstance);

  const update = () => updateRss(watchedState)
    .then(() => {
      setTimeout(update, 5000);
    })
    .catch((e) => console.log('Update RSS error!', e));

  update();

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const url = { url: formData.get('url') };
    const feedsUrls = state.feeds.map((feed) => feed.url);
    validation(url, feedsUrls)
      .then((data) => {
        if (data.url) {
          watchedState.form.process = 'loading';
          downloadRss(watchedState, data.url)
            .then(() => {
              watchedState.form.message = 'successAdding';
              watchedState.form.messageType = 'success';
              watchedState.form.process = 'successfully';
            })
            .catch((e) => {
              watchedState.form.message = e.message;
              watchedState.form.messageType = 'error';
              watchedState.form.process = 'error';
            });
        } else {
          watchedState.form.message = data.message;
          watchedState.form.messageType = 'error';
          watchedState.form.process = 'error';
        }
      });
  });
};
