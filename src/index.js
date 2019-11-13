import m from "mithril";
import CSS from "./styles";
import Folder, { FolderPlaceholder } from "./folder";
import Rss from "./rss";
import Clock from "./clock";
import { generateId } from "./util";

const makeFolderId = generateId("FOLDER");
const makeCardId = generateId("CARD");

const SAMPLE_TITLE = "Project title";
const SAMPLE_TIMEZONES = [
  "Europe/Lisbon",
  "Europe/Belgrade",
  "Europe/Istanbul"
];
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
  const folders = SAMPLE_FOLDERS.reduce((res, cur) => {
    const folderId = makeFolderId();
    res[folderId] = {
      title: cur.title,
      id: folderId,
      cards: cur.cards.reduce((res, cur) => {
        const cardId = makeCardId();
        res[cardId] = { id: cardId, ...cur };
        return res;
      }, {})
    };
    return res;
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

    folders[folderId].cards[cardId] = { title, link, id: makeCardId() };
  };
  const removeFolderItem = (folderId, itemId) =>
    delete folders[folderId].cards[itemId];

  return {
    view: () =>
      m(CSS.appContainer, [
        m(CSS.boardTitle, SAMPLE_TITLE),
        m(
          ".w5.mb4",
          SAMPLE_TIMEZONES.map(tz => m(Clock, { timezone: tz }))
        ),
        m(CSS.foldersContainer, [
          ...Object.values(folders).map(folder =>
            m(Folder, {
              ...folder,
              delete: () => removeFolder(folder.id),
              updateTitle: newTitle => updateFolderTitle(folder.id, newTitle),
              addItem: (title, link) => addFolderItem(folder.id, title, link),
              removeItem: itemId => removeFolderItem(folder.id, itemId)
            })
          ),
          m(FolderPlaceholder, {
            createFolder: () => createFolder()
          }),
          m(Rss)
        ])
      ]),
    oncreate: () => {
      dragula([...document.getElementsByClassName("folder-cards")]);
    },
    onupdate: () => {
      feather.replace();
    }
  };
};

const mountNode = document.querySelector("#app");
m.mount(mountNode, Root);
