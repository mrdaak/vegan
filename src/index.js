import m from "mithril";
import toml from "@iarna/toml";

import Folder, { FolderPlaceholder } from "./components/folder";
import Rss from "./components/rss";
import ClockFolder from "./components/clock";
import { generateId } from "./util";
import CSS from "./styles";
import { SAMPLE_BOARD } from "./const";

const makeFolderId = generateId("FOLDER");
const makeCardId = generateId("CARD");

const Root = () => {
  const cachedStore = localStorage.getItem("store");
  let store = cachedStore ? JSON.parse(cachedStore) : SAMPLE_BOARD;

  const drake = dragula({});

  const appendToDraggableContainers = vnode => drake.containers.push(vnode.dom);
  const cachedFolders = localStorage.getItem("folders");

  const reduceFolders = payload =>
    payload.reduce((result, folder) => {
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

  let folders = JSON.parse(cachedFolders) || reduceFolders(store.folders);

  const withCached = execFn => {
    execFn && execFn();
    localStorage.setItem("folders", JSON.stringify(folders));
  };

  withCached();

  const createFolder = () =>
    withCached(() => {
      const folderId = makeFolderId();
      if (folders[folderId]) {
        return createFolder();
      }

      folders[folderId] = { title: null, cards: {}, id: folderId };
    });
  const removeFolder = folderId =>
    withCached(() => {
      delete folders[folderId];
    });
  const updateFolderTitle = (folderId, newTitle) =>
    withCached(() => (folders[folderId].title = newTitle));
  const addFolderItem = (folderId, title, link) =>
    withCached(() => {
      const cardId = makeCardId();
      if (folders[folderId].cards[cardId]) {
        return addFolderItem(folderId, title, link);
      }

      folders[folderId].cards[cardId] = { title, link, id: cardId };
    });
  const removeFolderItem = (folderId, itemId) =>
    withCached(() => delete folders[folderId].cards[itemId]);

  const readConfigFile = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const config = toml.parse(e.target.result);
      const projectKey = Object.keys(config)[0];
      store = config[projectKey];
      localStorage.setItem("store", JSON.stringify(store));
      withCached(() => (folders = reduceFolders(config[projectKey].folders)));
    };
    reader.readAsText(file);
  };

  return {
    view: () =>
      m(CSS.appContainer, [
        m(CSS.header, [
          m(CSS.boardTitle, store.title),
          m(CSS.selectFileButton, { onchange: readConfigFile }),
          m(CSS.selectFileLabel, "load config")
        ]),
        m(CSS.foldersContainer, [
          ...Object.values(folders).map(folder =>
            m(Folder, {
              ...folder,
              makeDraggable: appendToDraggableContainers,
              delete: () => removeFolder(folder.id),
              updateTitle: newTitle => updateFolderTitle(folder.id, newTitle),
              addItem: (title, link) => addFolderItem(folder.id, title, link),
              removeItem: itemId => removeFolderItem(folder.id, itemId)
            })
          ),
          m(FolderPlaceholder, {
            createFolder: () => createFolder()
          }),
          store.rss_url ? m(Rss, { url: store.rss_url }) : null,
          store.timezones.length
            ? m(ClockFolder, { timezones: store.timezones })
            : null
        ])
      ]),
    oncreate: () => {
      feather.replace();
    },
    onupdate: () => {
      feather.replace();
    }
  };
};

const mountNode = document.querySelector("#app");
m.mount(mountNode, Root);
