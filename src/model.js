import m from "mithril";

import { generateId } from "./util";
import { SAMPLE_BOARD } from "./const";

const makeFolderId = generateId("FOLDER");
const makeCardId = generateId("CARD");

export const Folders = {
  data: null,
  createFolder: () => {
    const folderId = makeFolderId();
    if (Folders.data[folderId]) {
      return Folders.createFolder();
    }

    Folders.data[folderId] = { title: null, cards: {}, id: folderId };
    Folders.cache();
  },
  removeFolder: folderId => {
    delete Folders.data[folderId];
    Folders.cache();
  },
  updateFolderTitle: (folderId, title) => {
    Folders.data[folderId].title = title;
    Folders.cache();
  },
  addFolderCard: (folderId, title, link) => {
    const cardId = makeCardId();
    if (Folders.data[folderId].cards[cardId]) {
      return addFolderItem(folderId, title, link);
    }

    Folders.data[folderId].cards[cardId] = { title, link, id: cardId };
    Folders.cache();
  },
  removeFolderCard: (folderId, cardId) => {
    delete Folders.data[folderId].cards[cardId];
    Folders.cache();
  },
  cache: () => localStorage.setItem("folders", JSON.stringify(Folders.data)),
  loadFromCache: () =>
    (Folders.data = JSON.parse(localStorage.getItem("folders"))),
  loadFromConfig: folders => {
    Folders.data = folders.reduce((result, folder) => {
      const folderId = makeFolderId();
      result[folderId] = {
        title: folder.title,
        id: folderId,
        cards: folder.cards.reduce((result, card) => {
          const cardId = makeCardId();
          result[cardId] = { ...card, id: cardId };
          return result;
        }, {})
      };
      return result;
    }, {});

    Folders.cache();
  },
  init: () => {
    Folders.loadFromCache();
    if (!Folders.data) {
      Folders.loadFromConfig(
        JSON.parse(localStorage.getItem("store")) || SAMPLE_BOARD.folders
      );
    }

    Folders.cache();
  }
};

const CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

export const Feed = {
  data: null,
  error: null,
  fetch: url =>
    m
      .request({
        method: "GET",
        url: CORS_PROXY + url
      })
      .then(
        ({ items }) =>
          (Feed.data = items.reduce((result, article) => {
            result[article.guid] = article;
            return result;
          }, {}))
      )
      .catch(error => (Feed.error = error))
};
