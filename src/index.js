import m from "mithril";

import Folder, { FolderPlaceholder } from "./components/folder";
import Rss from "./components/rss";
import ClockFolder from "./components/clock";
import { generateId } from "./util";
import CSS from "./styles";

const makeFolderId = generateId("FOLDER");
const makeCardId = generateId("CARD");

const SAMPLE_TITLE = "Project title";
const SAMPLE_TIMEZONES = [
  "Europe/Lisbon",
  "Europe/Belgrade",
  "Europe/Istanbul"
];
const SAMPLE_FEED_URL = "https://blog.codinghorror.com/rss";
const SAMPLE_FOLDERS = [
  {
    title: "Folder 1",
    cards: [
      { title: "Card A", link: "" },
      { title: "Card B", link: "" }
    ]
  },
  {
    title: "Folder 2",
    cards: [
      { title: "Card C", link: "" },
      { title: "Card D", link: "" }
    ]
  }
];

const Root = () => {
  const drake = dragula({});
  drake.on("drop", (el, target, source) => {
    // folders[target.id].cards[el.id] = { ...folders[source.id].cards[el.id] };
    // delete folders[source.id].cards[el.id];
  });

  const appendToDraggableContainers = vnode => drake.containers.push(vnode.dom);

  const folders = SAMPLE_FOLDERS.reduce((result, folder) => {
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

  const createFolder = () => {
    const folderId = makeFolderId();
    if (folders[folderId]) {
      return createFolder();
    }

    folders[folderId] = { title: null, cards: {}, id: folderId };
  };
  const removeFolder = folderId => {
    delete folders[folderId];
  };
  const updateFolderTitle = (folderId, newTitle) =>
    (folders[folderId].title = newTitle);
  const addFolderItem = (folderId, title, link) => {
    const cardId = makeCardId();
    if (folders[folderId].cards[cardId]) {
      return addFolderItem(folderId, title, link);
    }

    folders[folderId].cards[cardId] = { title, link, id: cardId };
  };
  const removeFolderItem = (folderId, itemId) =>
    delete folders[folderId].cards[itemId];

  return {
    view: () =>
      m(CSS.appContainer, [
        m(CSS.boardTitle, SAMPLE_TITLE),
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
          m(Rss, { url: SAMPLE_FEED_URL }),
          m(ClockFolder, { timezones: SAMPLE_TIMEZONES })
        ])
      ]),
    onupdate: () => {
      feather.replace();
    }
  };
};

const mountNode = document.querySelector("#app");
m.mount(mountNode, Root);
