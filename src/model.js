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
      id: cardId,
      index:
        Object.keys(Boards._data[boardId].folders[folderId].cards).length + 1
    };
    Boards.cache();
  },
  removeFolderCard: (boardId, folderId, cardId) => {
    const index = Boards._data[boardId].folders[folderId].cards[cardId].index;
    delete Boards._data[boardId].folders[folderId].cards[cardId];

    Object.keys(Boards._data[boardId].folders[folderId].cards).forEach(
      cardId => {
        const card = Boards._data[boardId].folders[folderId].cards[cardId];
        if (card.index >= index) {
          card.index -= 1;
        }
      }
    );

    Boards.cache();
  },
  moveCard: (boardId, cardId, fromFolderId, toFolderId, index) => {
    const sourceCard =
      Boards._data[boardId].folders[fromFolderId].cards[cardId];

    let cards;
    if (fromFolderId === toFolderId) {
      cards = Object.values(
        Boards._data[boardId].folders[fromFolderId].cards
      ).sort((a, b) => a.index - b.index);
      const targetCard = cards.find(c => c.index === index);

      const draggedIndex = cards.indexOf(sourceCard);
      const droppedIndex = cards.indexOf(targetCard);

      const insertionIndex =
        draggedIndex < droppedIndex ? droppedIndex + 1 : droppedIndex;
      const deletionIndex =
        draggedIndex > droppedIndex ? draggedIndex + 1 : draggedIndex;

      if (insertionIndex !== deletionIndex) {
        cards.splice(insertionIndex, 0, sourceCard);
        cards.splice(deletionIndex, 1);
      }
    } else {
      cards = Object.values(
        Boards._data[boardId].folders[toFolderId].cards
      ).sort((a, b) => a.index - b.index);
      const targetCard = cards.find(c => c.index === index);

      if (!targetCard) {
        cards.push(sourceCard);
      } else {
        cards.splice(index, 0, sourceCard);
      }

      delete Boards._data[boardId].folders[fromFolderId].cards[cardId];
    }

    Boards._data[boardId].folders[toFolderId].cards = cards.reduce(
      (res, c, i) => {
        c.index = i + 1;
        res[c.id] = c;
        return res;
      },
      {}
    );

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
            cards: folder.cards.reduce((result, card, i) => {
              const cardId = makeCardId();
              result[cardId] = { ...card, id: cardId, index: i + 1 };
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
