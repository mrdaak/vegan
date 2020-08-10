import m from "mithril";
import * as R from "ramda";

import { generateId } from "./util";
import { SAMPLE_BOARD } from "./const";

const CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const LOCAL_STORAGE_DATA_KEY = "boards";
const LOCAL_STORAGE_ACTIVE_KEY = "active";

const makeBoardId = generateId("BOARD");
const makeFolderId = generateId("FOLDER");
const makeCardId = generateId("CARD");

const view = lens => R.view(lens, Boards._data);
const set = (lens, payload, src) => R.set(lens, payload, src || Boards._data);

const boardsLens = (boardId = null) => {
  const path = [];
  boardId && path.push(boardId);
  return R.lensPath(path);
};
const foldersLens = (folderId = null) => {
  const path = [Boards.active, "folders"];
  folderId && path.push(folderId);
  return R.lensPath(path);
};
const cardsLens = (folderId, cardId = null) => {
  const path = [Boards.active, "folders", folderId, "cards"];
  cardId && path.push(cardId);
  return R.lensPath(path);
};

export const Boards = {
  _data: null,
  active: null,
  setActive: id => {
    Boards.active = id || null;
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, JSON.stringify(id));
  },
  commit: data => {
    Boards._data = data;
    Boards.cache();
  },
  getAll: () => R.values(view(boardsLens())).sort((a, b) => a.index - b.index),
  getActiveBoard: () => view(boardsLens(Boards.active)),
  getActiveBoardFolders: () => R.values(view(foldersLens())),
  getNavigationData: () => R.map(R.pick(["id", "title"]), Boards.getAll()),
  createBoard: () => {
    const boardId = makeBoardId();
    const lens = boardsLens(boardId);
    if (view(lens)) {
      return Boards.createBoard();
    }

    const board = {
      id: boardId,
      index: Object.keys(view(boardsLens())).length + 1,
      title: null,
      timezones: [],
      rss_url: null,
      folders: {}
    };
    Boards.commit(set(lens, board));
  },
  removeBoard: boardId => {
    const nextBoard = Boards.getAll().find(b => b.id !== boardId);
    if (nextBoard) {
      Boards.setActive(nextBoard.id);
    }
    const lens = boardsLens();
    Boards.commit(set(lens, R.dissoc(boardId, view(lens))));
  },
  updateBoardTitle: (title, boardId = null) => {
    const lens = boardsLens(boardId || Boards.active);
    Boards.commit(set(lens, R.merge(view(lens), { title })));
  },
  createFolder: () => {
    const folderId = makeFolderId();
    const lens = foldersLens(folderId);
    if (view(lens)) {
      return Boards.createFolder();
    }

    const folder = {
      title: null,
      cards: {},
      id: folderId,
      boardId: Boards.active
    };
    Boards.commit(set(lens, folder));
  },
  removeFolder: folderId => {
    const lens = foldersLens();
    Boards.commit(set(lens, R.dissoc(folderId, view(lens))));
  },
  updateFolderTitle: (folderId, title) => {
    const lens = foldersLens(folderId);
    Boards.commit(set(lens, R.merge(view(lens), { title })));
  },
  addFolderCard: (folderId, title, link) => {
    const cardId = makeCardId();
    const lens = cardsLens(folderId, cardId);
    if (view(lens)) {
      return addFolderItem(folderId, title, link);
    }

    const card = {
      title,
      link,
      id: cardId,
      index: Object.keys(view(cardsLens(folderId))).length + 1
    };
    Boards.commit(set(lens, card));
  },
  removeFolderCard: (folderId, cardId) => {
    const lens = cardsLens(folderId, cardId);
    const index = R.prop("index", view(lens));
    delete Boards._data[Boards.active].folders[folderId].cards[cardId];

    const updatedCards = Object.keys(view(cardsLens(folderId))).reduce(
      (res, cardId) => {
        const card = view(cardsLens(folderId, cardId));
        if (card.index >= index) {
          card.index -= 1;
        }
        res[cardId] = card;
        return res;
      },
      {}
    );

    Boards.commit(set(cardsLens(folderId), updatedCards));
  },
  moveCard: (cardId, fromFolderId, toFolderId, index) => {
    const sourceCard = view(cardsLens(fromFolderId, cardId));

    let cards;
    let payload;
    if (fromFolderId === toFolderId) {
      cards = Object.values(view(cardsLens(fromFolderId))).sort(
        (a, b) => a.index - b.index
      );
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
      cards = Object.values(view(cardsLens(toFolderId))).sort(
        (a, b) => a.index - b.index
      );
      const targetCard = cards.find(c => c.index === index);

      if (!targetCard) {
        cards.push(sourceCard);
      } else {
        cards.splice(index - 1, 0, sourceCard);
      }

      payload = set(
        cardsLens(fromFolderId),
        R.dissoc(cardId, view(cardsLens(fromFolderId)))
      );
    }

    payload = set(
      cardsLens(toFolderId),
      cards.reduce((res, c, i) => {
        c.index = i + 1;
        res[c.id] = c;
        return res;
      }, {}),
      payload
    );
    Boards.commit(payload);
  },
  cache: () =>
    localStorage.setItem(
      LOCAL_STORAGE_DATA_KEY,
      JSON.stringify(view(boardsLens()))
    ),
  loadFromCache: () => {
    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA_KEY));
    const activeId = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY));
    if (data) {
      const id =
        activeId ||
        R.prop(
          "id",
          R.values(R.view(boardsLens(), data)).find(b => b.index === 1)
        );
      Boards.setActive(id);
      Boards.commit(data);
    }
  },
  loadFromConfig: config => {
    const payload = Object.values(config).reduce((result, board, i) => {
      const boardId = makeBoardId();
      result[boardId] = {
        id: boardId,
        index: i + 1,
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

    Boards.setActive(
      R.prop(
        "id",
        R.values(R.view(boardsLens(), payload)).find(b => b.index === 1)
      )
    );
    Boards.commit(payload);
  },
  init: () => {
    Boards.loadFromCache();
    if (!Boards._data) {
      Boards.loadFromConfig(SAMPLE_BOARD);
    }
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
