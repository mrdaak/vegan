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
                    Boards.addFolderCard(attrs.folderId, title);
                  }
                  title = null;
                }

                if (e.key === "Escape") {
                  isEditingTitle = false;
                  title = null;
                }
              }
            })
      );
    }
  };
};

const initialDragAndDropCardsState = {
  sourceCard: null,
  targetCard: null,
  sourceFolderId: null
};
let dragAndDropCardsState = { ...initialDragAndDropCardsState };
const resetDragAndDropCardsState = () => {
  dragAndDropCardsState = { ...initialDragAndDropCardsState };
};

const getDragAndDropCardStateClass = card =>
  card === dragAndDropCardsState.sourceCard
    ? "dragging"
    : card === dragAndDropCardsState.targetCard
    ? "dropping"
    : "";

const Folder = initialVnode => {
  let isEditingTitle = !initialVnode.attrs.title;
  let newTitle = null;

  return {
    view: ({ attrs }) => {
      const cardList = Object.values(attrs.cards).sort(
        (a, b) => a.index - b.index
      );

      return m(
        CSS.folder,
        {
          ondragover: e => {
            e.preventDefault();
          },
          ondrop: e => {
            e.preventDefault();

            if (dragAndDropCardsState.sourceCard) {
              Boards.moveCard(
                dragAndDropCardsState.sourceCard.id,
                dragAndDropCardsState.sourceFolderId,
                attrs.id,
                dragAndDropCardsState.targetCard
                  ? dragAndDropCardsState.targetCard.index
                  : 1
              );
              resetDragAndDropCardsState();
              return;
            }
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
                      }
                    },
                    attrs.title
                  ),
                  m(
                    ".pointer",
                    {
                      onclick: () => Boards.removeFolder(attrs.id)
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
                      Boards.removeFolder(attrs.id);
                    }
                    newTitle = null;
                  },
                  onkeydown: e => {
                    if (e.key === "Enter") {
                      isEditingTitle = false;
                      if (newTitle) {
                        Boards.updateFolderTitle(attrs.id, newTitle);
                        newTitle = null;
                        return;
                      }

                      if (!attrs.title && !newTitle) {
                        Boards.removeFolder(attrs.id);
                      }
                    }

                    if (e.key === "Escape") {
                      isEditingTitle = false;

                      if (!attrs.title) {
                        Boards.removeFolder(attrs.id);
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
                  m(".relative.hide-child.break-word", { id: item.id }, [
                    m(
                      CSS.folderCard,
                      {
                        draggable: true,
                        href: item.link,
                        class: getDragAndDropCardStateClass(item),
                        ondragstart: e => {
                          dragAndDropCardsState.sourceCard = item;
                          dragAndDropCardsState.sourceFolderId = attrs.id;
                        },
                        ondragover: _e => {
                          if (dragAndDropCardsState.sourceCard) {
                            dragAndDropCardsState.targetCard = item;
                          }
                        },
                        ondragend: _e => {
                          resetDragAndDropCardsState();
                        }
                      },
                      item.title
                    ),
                    m(
                      ".pointer",
                      {
                        onclick: () =>
                          Boards.removeFolderCard(attrs.id, item.id)
                      },
                      m(CSS.iconX)
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
      m(".pointer", { onclick: () => Boards.createFolder() }, m(CSS.iconPlus))
    )
};

export default Folder;
