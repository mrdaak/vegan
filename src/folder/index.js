import m from "mithril";
import CSS from "../styles";
import { renderIfCondition } from "../util";

const PlaceholderCard = () => {
  let isEditingTitle = false;
  let title = null;

  return {
    view: ({ attrs }) =>
      m(
        CSS.folderCardPlaceholder,
        {
          onclick: () => {
            isEditingTitle = true;
          }
        },
        !isEditingTitle
          ? "add card"
          : m(`${CSS.inputField}.f5`, {
              oncreate: vnode => vnode.dom.focus(),
              value: title,
              oninput: e => (title = e.target.value),
              onfocusout: () => {
                isEditingTitle = false;
                title = null;
              },
              onkeydown: e => {
                if (e.key === "Enter") {
                  isEditingTitle = false;
                  if (title) {
                    attrs.addItem(title);
                  }
                  title = null;
                }
              }
            })
      )
  };
};

const Folder = () => {
  let isEditingTitle = false;
  let newTitle = null;

  return {
    view: ({ attrs }) => {
      if (!attrs.title && !isEditingTitle) {
        isEditingTitle = true;
      }

      const cardList = Object.values(attrs.cards);

      return m(
        CSS.folder,
        {
          style: {
            maxHeight: "42rem",
            minHeight: "16rem",
            height: "min-content"
          }
        },
        [
          m(CSS.folderHeader, [
            !isEditingTitle
              ? m(
                  CSS.folderTitle,
                  {
                    ondblclick: () => (isEditingTitle = true),
                    style: { wordBreak: "break-all" }
                  },
                  attrs.title
                )
              : m(CSS.inputField, {
                  oncreate: vnode => vnode.dom.focus(),
                  value: newTitle || attrs.title,
                  oninput: e => (newTitle = e.target.value),
                  onfocusout: () => {
                    isEditingTitle = false;
                    if (!attrs.title && !newTitle) {
                      attrs.delete();
                    }
                    newTitle = null;
                  },
                  onkeydown: e => {
                    if (e.key === "Enter") {
                      isEditingTitle = false;
                      if (newTitle) {
                        attrs.updateTitle(newTitle);
                      }
                      newTitle = null;
                    }
                  }
                }),
            !isEditingTitle &&
              m(".pointer", { onclick: () => attrs.delete() }, m(CSS.iconTrash))
          ]),
          m(
            `.folder-cards${CSS.folderCardsWrapper}`,
            { style: { minHeight: "160px" } },
            renderIfCondition(cardList.length, () =>
              cardList.map(item =>
                m(".relative.hide-child", [
                  m(
                    CSS.folderCard,
                    {
                      href: item.link,
                      style: { wordBreak: "break-all" }
                    },
                    item.title
                  ),
                  m(
                    ".pointer",
                    {
                      onclick: () => {
                        attrs.removeItem(item.id);
                      }
                    },
                    m(CSS.iconX, {
                      style: {
                        width: "1rem",
                        height: "1rem",
                        right: "5px",
                        top: "10px"
                      }
                    })
                  )
                ])
              )
            )
          ),
          m(PlaceholderCard, { addItem: attrs.addItem })
        ]
      );
    }
  };
};

export const FolderPlaceholder = {
  view: ({ attrs }) =>
    m(
      CSS.folderPlaceholder,
      m(
        ".pointer",
        {
          onclick: () => {
            attrs.createFolder();
          }
        },
        m(CSS.iconPlus, {
          style: { width: "60px", height: "60px" }
        })
      )
    )
};

export default Folder;
