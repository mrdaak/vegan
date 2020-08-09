import m from "mithril";

import Folder, { FolderPlaceholder } from "./view/folder";
import Rss from "./view/rss";
import ClockFolder from "./view/clock";
import CSS from "./style";
import { Boards } from "./model";
import { readConfigFile } from "./util";

const App = () => {
  Boards.init();

  let isEditingTitle = false;
  let newTitle = null;

  return {
    view: () => {
      const board = Boards.getActiveBoard();
      const folders = Boards.getActiveBoardFolders();

      return m(CSS.appContainer, [
        m(CSS.header, [
          !isEditingTitle
            ? m(
                CSS.boardTitle,
                {
                  ondblclick: () => {
                    isEditingTitle = true;
                    newTitle = board.title;
                  }
                },
                board.title
              )
            : m(CSS.boardTitleInputField, {
                oncreate: vnode => vnode.dom.focus(),
                value: newTitle,
                maxlength: 30,
                oninput: e => (newTitle = e.target.value),
                onfocusout: () => {
                  isEditingTitle = false;
                  newTitle = null;
                },
                onkeydown: e => {
                  if (e.key === "Enter") {
                    isEditingTitle = false;
                    if (newTitle) {
                      Boards.updateBoardTitle(newTitle);
                      newTitle = null;
                      return;
                    }
                  }

                  if (e.key === "Escape") {
                    isEditingTitle = false;
                    newTitle = null;
                  }
                }
              }),
          m(CSS.uploadConfigContainer, [
            m(CSS.selectFileButton, {
              onchange: readConfigFile(Boards.loadFromConfig)
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
