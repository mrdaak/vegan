import m from "mithril";

import Folder, { FolderPlaceholder } from "./view/folder";
import Rss from "./view/rss";
import ClockFolder from "./view/clock";
import CSS from "./style";
import { Boards } from "./model";
import { readConfigFile } from "./util";

const App = () => {
  Boards.init();
  const getActiveBoardId = () => {
    const allBoards = Boards.getAll();
    return allBoards.length ? allBoards[0].id : null;
  };
  let activeBoardId = getActiveBoardId();

  const handleNewConfig = config => {
    Boards.loadFromConfig(config);
    activeBoardId = getActiveBoardId();
  };

  return {
    view: () => {
      const board = Boards.getBoardWithId(activeBoardId);
      const folders = board.folders ? Object.values(board.folders) : [];

      return m(CSS.appContainer, [
        m(CSS.header, [
          m(CSS.boardTitle, board.title),
          m(CSS.uploadConfigContainer, [
            m(CSS.selectFileButton, {
              onchange: readConfigFile(handleNewConfig)
            }),
            m(CSS.selectFileLabel, "load config")
          ])
        ]),
        m(CSS.foldersContainer, [
          ...folders.map(folder =>
            m(Folder, {
              ...folder,
              boardId: board.id
            })
          ),
          m(FolderPlaceholder, { boardId: board.id }),
          board.rss_url ? m(Rss, { url: board.rss_url }) : null,
          board.timezones.length
            ? m(ClockFolder, { timezones: board.timezones })
            : null
        ])
      ]);
    },
    oncreate: () => {
      feather.replace();
    },
    onupdate: () => {
      feather.replace();
    }
  };
};

const mountNode = document.querySelector("#app");
m.mount(mountNode, App);
