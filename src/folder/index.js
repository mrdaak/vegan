import m from "mithril";
import CSS from "../styles";

const Folder = () => {
  let isEditingTitle = false;
  let newTitle = null;

  return {
    view: ({ attrs }) => {
      const isPlaceholder = !!attrs.placeholder;
      if (!attrs.title && !isEditingTitle) {
        isEditingTitle = true;
      }

      const cardList = !isPlaceholder ? Object.values(attrs.cards) : [];

      return m(`${isPlaceholder ? CSS.folderPlaceholder : CSS.folder}`, [
        !isPlaceholder &&
          m(CSS.folderHeader, [
            !isEditingTitle
              ? m(
                  CSS.folderTitle,
                  { ondblclick: () => (isEditingTitle = true) },
                  attrs.title
                )
              : m(`input[type=text]${CSS.inputField}`, {
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
            !isPlaceholder &&
              m(
                ".pointer",
                { onclick: () => attrs.delete() },
                m("i[data-feather=trash-2].moon-gray.hover-black")
              )
          ]),
        !isPlaceholder
          ? m(
              `.folder-cards${CSS.folderCardsWrapper}`,
              cardList.length &&
                cardList.map(item =>
                  m(CSS.folderCard, { href: item.link }, item.title)
                )
            )
          : m(
              ".pointer",
              {
                onclick: () => {
                  attrs.createFolder();
                }
              },
              m("i[data-feather=plus-circle].moon-gray.grow.hover-gray", {
                style: { width: "60px", height: "60px" }
              })
            )
      ]);
    }
  };
};

export default Folder;
