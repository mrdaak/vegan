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

  let isEditingNewBoardTitle = false;
  let newBoardTitle = null;

  return {
    view: () => {
      const board = Boards.getActiveBoard();
      const folders = Boards.getActiveBoardFolders();
      const navItems = Boards.getNavigationData();

      return m(CSS.appContainer, [
        m(CSS.navigationWrapper, [
          m(".mr3", "Boards: "),
          ...navItems.map(i => {
            return i.title
              ? m(
                  `.pointer.mr4${i.id === Boards.active ? ".underline" : ""}`,
                  { onclick: () => Boards.setActive(i.id) },
                  i.title
                )
              : m(CSS.navigationTitleInputField, {
                  oncreate: vnode => {
                    vnode.dom.focus();
                  },
                  value: newBoardTitle,
                  maxlength: 30,
                  oninput: e => {
                    newBoardTitle = e.target.value;
                  },
                  onfocusout: () => {
                    newBoardTitle = null;
                    isEditingNewBoardTitle = false;
                    Boards.removeBoard(i.id);
                  },
                  onkeydown: e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      isEditingNewBoardTitle = false;
                      if (newBoardTitle) {
                        Boards.updateBoardTitle(newBoardTitle, i.id);
                        newBoardTitle = null;
                        Boards.setActive(i.id);
                        return;
                      }
                      Boards.removeBoard(i.id);
                      return;
                    }

                    if (e.key === "Escape") {
                      isEditingNewBoardTitle = false;
                      newBoardTitle = null;
                      Boards.removeBoard(i.id);
                      return;
                    }
                  }
                });
          }),
          !isEditingNewBoardTitle &&
            m(
              ".pointer",
              {
                onclick: () => {
                  Boards.createBoard();
                  isEditingNewBoardTitle = true;
                }
              },
              m(`${CSS.iconPlus}.icon-plus--small`)
            ),
          m(CSS.uploadConfigContainer, [
            m(CSS.selectFileButton, {
              onchange: readConfigFile(Boards.loadFromConfig)
            }),
            m(CSS.selectFileLabel, "load config")
          ])
        ]),
        board
          ? [
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
                m(
                  ".pointer",
                  { onclick: () => Boards.removeBoard(board.id) },
                  "delete"
                )
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
                board.timezones && board.timezones.length
                  ? m(ClockFolder, { timezones: board.timezones })
                  : null
              ])
            ]
          : null
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
