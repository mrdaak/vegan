import m from "mithril";

import CSS from "../style";
import { Folders } from "../model";

const drake = dragula({});

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
                    Folders.addFolderCard(attrs.folderId, title);
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

  return {
    view: ({ attrs }) => {
      const cardList = Object.values(attrs.cards);

      return m(CSS.folder, { style: CSS.folderStyleAttribute }, [
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
                  { onclick: () => Folders.removeFolder(attrs.id) },
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
                    Folders.removeFolder(attrs.id);
                  }
                  newTitle = null;
                },
                onkeydown: e => {
                  if (e.key === "Enter") {
                    isEditingTitle = false;
                    if (newTitle) {
                      Folders.updateFolderTitle(attrs.id, newTitle);
                      newTitle = null;
                      return;
                    }

                    if (!attrs.title && !newTitle) {
                      Folders.removeFolder(attrs.id);
                    }
                  }
                }
              })
        ),
        m(
          CSS.folderCardsWrapper,
          {
            id: initialVnode.attrs.id,
            oncreate: vnode => drake.containers.push(vnode.dom),
            style: { minHeight: "160px" }
          },
          cardList.length
            ? cardList.map(item =>
                m(".relative.hide-child", { id: item.id }, [
                  m(
                    CSS.folderCard,
                    {
                      href: item.link,
                      style: CSS.wordWrapStyleAttribute
                    },
                    item.title
                  ),
                  m(
                    ".pointer",
                    {
                      onclick: () => Folders.removeFolderCard(attrs.id, item.id)
                    },
                    m(CSS.iconX, { style: CSS.iconXStyleAttribute })
                  )
                ])
              )
            : null
        ),
        m(PlaceholderCard, { folderId: attrs.id })
      ]);
    }
  };
};

export const FolderPlaceholder = {
  view: () =>
    m(
      CSS.folderPlaceholder,
      { style: { minWidth: "16rem" } },
      m(
        ".pointer",
        { onclick: () => Folders.createFolder() },
        m(CSS.iconPlus, { style: CSS.iconPlusStyleAttribute })
      )
    )
};

export default Folder;
