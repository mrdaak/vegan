import m from "mithril";

import { generateId } from "./util";
import { SAMPLE_BOARD } from "./const";

const CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

const makeBoardId = generateId("BOARD");
const makeFolderId = generateId("FOLDER");
const makeCardId = generateId("CARD");

export const Boards = {
  _data: null,
  getAll: () => Object.values(Boards._data),
  getBoardWithId: boardId => Boards._data[boardId],
  createBoard: () => {
    const boardId = makeBoardId();
    if (Boards._data[boardId]) {
      return Boards.createBoard();
    }

    Boards._data[boardId] = {
      title: null,
      timezones: null,
      rss_url: null,
      folders: {}
    };
    Boards.cache();
  },
  removeBoard: boardId => {
    delete Boards._data[boardId];
    Boards.cache();
  },
  updateBoardTitle: (boardId, title) => {
    Boards._data[boardId].title = title;
    Boards.cache();
  },
  createFolder: boardId => {
    const folderId = makeFolderId();
    if (Boards._data[boardId].folders[folderId]) {
      return Boards.createFolder();
    }

    Boards._data[boardId].folders[folderId] = {
      title: null,
      cards: {},
      id: folderId,
      boardId
    };
    Boards.cache();
  },
  removeFolder: (boardId, folderId) => {
    delete Boards._data[boardId].folders[folderId];
    Boards.cache();
  },
  updateFolderTitle: (boardId, folderId, title) => {
    Boards._data[boardId].folders[folderId].title = title;
    Boards.cache();
  },
  addFolderCard: (boardId, folderId, title, link) => {
    const cardId = makeCardId();
    if (Boards._data[boardId].folders[folderId].cards[cardId]) {
      return addFolderItem(boardId, folderId, title, link);
    }

    Boards._data[boardId].folders[folderId].cards[cardId] = {
      title,
      link,
      id: cardId
    };
    Boards.cache();
  },
  removeFolderCard: (boardId, folderId, cardId) => {
    delete Boards._data[boardId].folders[folderId].cards[cardId];
    Boards.cache();
  },
  cache: () => localStorage.setItem("boards", JSON.stringify(Boards._data)),
  loadFromCache: () =>
    (Boards._data = JSON.parse(localStorage.getItem("boards"))),
  loadFromConfig: config => {
    Boards._data = Object.values(config).reduce((result, board) => {
      const boardId = makeBoardId();
      result[boardId] = {
        id: boardId,
        title: board.title,
        timezones: board.timezones,
        rss_url: board.rss_url,
        folders: Object.values(board.folders).reduce((result, folder) => {
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
        }, {})
      };
      return result;
    }, {});

    Boards.cache();
  },
  init: () => {
    Boards.loadFromCache();
    if (!Boards._data) {
      Boards.loadFromConfig(
        JSON.parse(localStorage.getItem("boards")) || SAMPLE_BOARD
      );
    }

    Boards.cache();
  }
};

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
