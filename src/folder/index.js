import m from "mithril";
import CSS from "../styles";
import { renderIfCondition } from "../util";

const Folder = () => {
  let isEditingTitle = false;
  let newTitle = null;

  return {
    view: ({ attrs }) => {
      if (!attrs.title && !isEditingTitle) {
        isEditingTitle = true;
      }

      const cardList = Object.values(attrs.cards);

      return m(CSS.folder, [
        m(CSS.folderHeader, [
          !isEditingTitle
            ? m(
                CSS.folderTitle,
                { ondblclick: () => (isEditingTitle = true) },
                attrs.title
              )
            : m(CSS.inputField, {
                oncreate: vnode => vnode.dom.focus(),
                value: newTitle || attrs.title,
                oninput: e => (newTitle = e.target.value),
                onfocusout: () => {
                  isEditingTitle = false;
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
          m(".pointer", { onclick: () => attrs.delete() }, m(CSS.iconTrash))
        ]),
        m(
          `.folder-cards${CSS.folderCardsWrapper}`,
          renderIfCondition(cardList.length, () =>
            cardList.map(item =>
              m(".relative.hide-child", [
                m(CSS.folderCard, { href: item.link }, item.title),
                m(
                  "",
                  {
                    onclick: () => {
                      attrs.removeItem(item.id);
                    }
                  },
                  m(CSS.iconX, {
                    style: {
                      width: "18px",
                      height: "18px",
                      right: "5px",
                      top: "9px"
                    }
                  })
                )
              ])
            )
          )
        )
      ]);
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
