import onChange from 'on-change';

const renderFeeds = (feeds, elements, i18nInstance) => {
  const container = elements.feeds;
  container.textContent = '';

  const title = document.createElement('h3');
  title.textContent = i18nInstance.t('blocksName.feeds');
  title.classList.add('px-3');
  container.append(title);

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0');

  const feedItems = feeds.map((feed) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0');

    const itemTitle = document.createElement('h4');
    itemTitle.textContent = feed.title;
    itemTitle.classList.add('h6');

    const itemDesc = document.createElement('p');
    itemDesc.classList.add('small', 'text-black-50');
    itemDesc.textContent = feed.description;

    item.append(itemTitle, itemDesc);

    return item;
  });

  feedList.append(...feedItems.reverse());
  container.append(feedList);
};

const renderItems = (posts, elements, i18nInstance) => {
  const container = elements.posts;
  container.textContent = '';

  const title = document.createElement('h3');
  title.textContent = i18nInstance.t('blocksName.posts');
  title.classList.add('px-3');
  container.append(title);

  const postList = document.createElement('ul');
  postList.classList.add('list-group', 'border-0');

  const postItems = posts.map((post) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0', 'd-flex', 'justify-content-between', 'align-items-start');
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');
    link.setAttribute('data-id', post.id);
    link.textContent = post.title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18nInstance.t('buttons.view');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-id', post.id);
    item.append(link, button);

    return item;
  });

  postList.append(...postItems);
  container.append(postList);
};

const renderMessage = ({ messageType, message }, form, i18nInstance) => {
  const p = form.querySelector('.feedback');
  const input = form.querySelector('input');

  switch (messageType) {
    case 'success':
      input.classList.remove('is-invalid');
      p.classList.remove('text-danger');
      p.classList.add('text-success');
      break;

    case 'error':
      input.classList.add('is-invalid');
      p.classList.remove('text-success');
      p.classList.add('text-danger');
      break;

    default:
      throw new Error();
  }

  switch (message) {
    case 'successAdding':
      p.textContent = i18nInstance.t(`messages.${message}`);
      form.reset();
      input.focus();
      break;

    case 'invalidURL':
    case 'noValidRss':
    case 'duplicate':
    case 'downloadError':
    case 'Network Error':
    case 'required':
      p.textContent = i18nInstance.t(`messages.${message}`);
      break;

    default:
      throw new Error(`Unknown error: '${message}'!`);
  }

  form.append(p);
};

const renderModal = (inboxId, posts) => {
  const modalPost = posts.filter(({ id }) => id === inboxId)[0];
  const modal = document.querySelector('#modal');

  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = modalPost.title;

  const modalBody = modal.querySelector('.modal-body');
  modalBody.textContent = modalPost.description;

  const articleLinkButton = modal.querySelector('.full-article');
  articleLinkButton.setAttribute('href', modalPost.link);
};

const markRead = (postIds) => {
  postIds.forEach((postId) => {
    const link = document.querySelector(`a[data-id="${postId}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
  });
};

export default (state, elements, i18nInstance) => {
  const modalAction = (watchedState) => Array
    .from(document.querySelectorAll('button[data-bs-toggle="modal"]'))
    .map((btn) => btn.addEventListener('click', () => {
      watchedState.form.modalId = btn.dataset.id;
      watchedState.form.readPosts.push(btn.dataset.id);
      watchedState.form.process = 'modal';
    }));

  const watchedState = onChange(state, (path, value) => {
    switch (state.form.process) {
      case 'filling':
        elements.input.removeAttribute('readonly');
        elements.button.disabled = false;
        break;

      case 'successfully':
        renderMessage(state.form, elements.form, i18nInstance);
        elements.input.removeAttribute('readonly');
        elements.button.disabled = false;
        renderFeeds(state.feeds, elements, i18nInstance);
        renderItems(state.items, elements, i18nInstance);
        modalAction(watchedState);
        break;

      case 'updated':
        renderItems(state.items, elements, i18nInstance);
        modalAction(watchedState);
        break;

      case 'loading':
        elements.input.setAttribute('readonly', true);
        elements.button.disabled = true;
        break;

      case 'error':
        renderMessage(state.form, elements.form, i18nInstance);
        elements.input.removeAttribute('readonly');
        elements.button.disabled = false;
        break;

      case 'modal':
        renderModal(state.form.modalId, state.items);
        markRead(state.form.readPosts);
        break;

      default:
        throw new Error(value);
    }
  });

  return watchedState;
};
