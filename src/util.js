const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ID_LENGTH = 8;

export const generateId = prefix => () => {
  let id = `${prefix}_`;
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return id;
};

// Parse bookmarks html file exported from Firefox/Chrome
export const parseBookmarksHtml = html => {
  const el = document.createElement("html");
  el.innerHTML = html;

  const folderTargetNodes = el.getElementsByTagName("DT");
  const folders = [];
  for (let folderNode of folderTargetNodes) {
    const titleTargetNode = folderNode.childNodes[0];
    const cardsTargetNode = folderNode.childNodes[2];
    const folder = null;
    if (titleTargetNode.nodeName === "H3") {
      folder = { title: titleTargetNode.innerText, cards: [] };
      for (let cardNode of cardsTargetNode.childNodes) {
        if (cardNode.nodeName === "DT") {
          folder.cards.push({
            title: cardNode.innerText,
            link: cardNode.lastElementChild.href
          });
        }
      }
      folders.push(folder);
    }
  }

  return folders;
};

export const renderIfCondition = (condition, renderFn) =>
  condition ? renderFn() : null;
