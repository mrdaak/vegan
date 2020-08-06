import m from "mithril";

import CSS from "../style";
import { Boards } from "../model";

const PlaceholderCard = () => {
  let isEditingTitle = false;
  let title = null;

  return {
    view: ({ attrs }) => {
      if (!isEditingTitle && title) {
        title = null;
      }
      return m(
        CSS.folderCardPlaceholder,
        {
          onclick: () => (isEditingTitle = true)
        },
        !isEditingTitle
          ? "add card"
          : m(`${CSS.inputField}.f5`, {
              oncreate: vnode => vnode.dom.focus(),
              value: title,
              maxlength: 70,
              oninput: e => (title = e.target.value),
              onfocusout: () => {
                isEditingTitle = false;
                title = null;
              },
              onkeydown: e => {
                if (e.key === "Enter") {
                  isEditingTitle = false;
                  if (title) {
                    Boards.addFolderCard(attrs.boardId, attrs.folderId, title);
                  }
                  title = null;
                }
              }
            })
      );
    }
  };
};

const Folder = initialVnode => {
  let isEditingTitle = !initialVnode.attrs.title;
  let newTitle = null;

  const dnd = { drag: null, drop: null };

  const dndClass = item =>
    item === dnd.drag ? "dragging" : item === dnd.drop ? "dropping" : "";

  return {
    view: ({ attrs }) => {
      const cardList = Object.values(attrs.cards).sort(
        (a, b) => a.index - b.index
      );

      return m(
        CSS.folder,
        {
          style: CSS.folderStyleAttribute,
          ondragover: e => {
            e.preventDefault();
          },
          ondrop: e => {
            e.preventDefault();

            if (!dnd.drag) {
              return;
            }

            Boards.moveCard(
              attrs.boardId,
              dnd.drag.id,
              attrs.id,
              attrs.id,
              dnd.drop ? dnd.drop.index : cardList.length + 1
            );
            dnd.drag = dnd.drop = null;
          }
        },
        [
          m(
            CSS.folderHeader,
            !isEditingTitle
              ? [
                  m(
                    CSS.folderTitle,
                    {
                      ondblclick: () => {
                        isEditingTitle = true;
                        newTitle = attrs.title;
                      },
                      style: CSS.wordWrapStyleAttribute
                    },
                    attrs.title
                  ),
                  m(
                    ".pointer",
                    {
                      onclick: () =>
                        Boards.removeFolder(attrs.boardId, attrs.id)
                    },
                    m(CSS.iconTrash)
                  )
                ]
              : m(CSS.inputField, {
                  oncreate: vnode => vnode.dom.focus(),
                  value: newTitle,
                  maxlength: 30,
                  oninput: e => (newTitle = e.target.value),
                  onfocusout: () => {
                    isEditingTitle = false;
                    if (!attrs.title && !newTitle) {
                      Boards.removeFolder(attrs.boardId, attrs.id);
                    }
                    newTitle = null;
                  },
                  onkeydown: e => {
                    if (e.key === "Enter") {
                      isEditingTitle = false;
                      if (newTitle) {
                        Boards.updateFolderTitle(
                          attrs.boardId,
                          attrs.id,
                          newTitle
                        );
                        newTitle = null;
                        return;
                      }

                      if (!attrs.title && !newTitle) {
                        Boards.removeFolder(attrs.boardId, attrs.id);
                      }
                    }
                  }
                })
          ),
          m(
            CSS.folderCardsWrapper,
            {
              id: initialVnode.attrs.id,
              style: { minHeight: "160px" }
            },
            cardList.length
              ? cardList.map(item =>
                  m(".relative.hide-child", { id: item.id }, [
                    m(
                      CSS.folderCard,
                      {
                        draggable: true,
                        href: item.link,
                        style: CSS.wordWrapStyleAttribute,
                        class: dndClass(item),
                        ondragstart: e => {
                          dnd.drag = item;
                        },
                        ondragover: _e => {
                          if (dnd.drag) dnd.drop = item;
                        },
                        ondragend: _e => {
                          dnd.drag = dnd.drop = null;
                        }
                      },
                      item.title
                    ),
                    m(
                      ".pointer",
                      {
                        onclick: () =>
                          Boards.removeFolderCard(
                            attrs.boardId,
                            attrs.id,
                            item.id
                          )
                      },
                      m(CSS.iconX, { style: CSS.iconXStyleAttribute })
                    )
                  ])
                )
              : null
          ),
          m(PlaceholderCard, { boardId: attrs.boardId, folderId: attrs.id })
        ]
      );
    }
  };
};

export const FolderPlaceholder = {
  view: ({ attrs }) =>
    m(
      CSS.folderPlaceholder,
      { style: { minWidth: "16rem" } },
      m(
        ".pointer",
        { onclick: () => Boards.createFolder(attrs.boardId) },
        m(CSS.iconPlus, { style: CSS.iconPlusStyleAttribute })
      )
    )
};

export default Folder;
