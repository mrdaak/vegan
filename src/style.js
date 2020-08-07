/*
Theme style definitions using Tachyons.
Complete list of tags: http://tachyons.io/docs/table-of-styles/
*/

const CSS = {
  appContainer: ".vh-100.pa4.helvetica",
  header: ".flex.items-center.mb4",
  boardTitle: ".f1.mr3",

  uploadConfigContainer: "div.relative.w4.h2",
  selectFileButton:
    "input[type=file][name=file][id=file].absolute.overflow-hidden.o-0.top-0.left-0.w-100",
  selectFileLabel:
    "label[for=file].gray.hover-black.pointer.absolute.top-0.left-0.w-100",

  /** Folder */
  foldersContainer: ".flex",
  folder:
    ".db.ba.b--black-10.w5.black.bg-light-yellow.pa2.mr3.shadow-4.br1.overflow-x-auto.relative",
  folderStyleAttribute: {
    minWidth: "16rem",
    maxHeight: "42rem",
    minHeight: "16rem",
    height: "min-content"
  },
  folderHeader: ".db.flex.justify-between",
  folderTitle: ".w-90.med-gray.f4",
  folderCardsWrapper: ".db.w-100",
  folderCard:
    "a.db.ba.b--black-10.bg-washed-yellow.mv1.pl2.pt2.pr3.pb2.link.black.hide-child",
  folderCardPlaceholder:
    ".db.ba.b--dashed.bw1.b--black-10.mt2.pa2.tc.black-30.pointer.f5",
  folderPlaceholder:
    ".h5.db.ba.b--dashed.bw1.b--black-10.w5.br1.mr3.flex.bg-washed-yellow.justify-center.items-center",
  inputField: "textarea.bn.mb2.db.w-90.bg-light-yellow.f4.outline-0",
  boardTitleInputField: "textarea.bn.f1.mr3.bg-washed-yellow",
  createFolderButton:
    "div.br-100.bg-moon-gray.white.w3.h3.flex.justify-center.items-center.f1.pointer",

  /** Icons */
  iconRss: "i[data-feather=rss]",

  iconExternalLink: "i[data-feather=external-link].child.relative",
  iconExternalLinkStyleAttribute: {
    width: "15px",
    height: "15px",
    top: "2px",
    left: "2px"
  },

  iconClock: "i[data-feather=clock]",
  iconTrash: "i[data-feather=trash-2].black.child",

  iconPlus: "i[data-feather=plus-circle].moon-gray.grow.hover-gray",
  iconPlusStyleAttribute: { width: "60px", height: "60px" },

  iconX: "i[data-feather=x].child.black.absolute",
  iconMove: "i[data-feather=move].child.black.absolute",
  iconXStyleAttribute: {
    width: "1rem",
    height: "1rem",
    right: "5px",
    top: "11px"
  },

  iconMoveStyleAttribute: {
    width: "0.8rem",
    height: "0.8rem",
    right: "25px",
    top: "12px"
  },

  iconFrown: "i[data-feather=frown].mt4.mb1",
  iconFrownStyleAttribute: {
    width: "3rem",
    height: "3rem"
  },

  /** various */
  wordWrapStyleAttribute: { wordBreak: "break-word" }
};

export default CSS;
