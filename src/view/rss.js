import m from "mithril";

import { Feed } from "../model";
import CSS from "../style";

const Rss = {
  oninit: ({ attrs }) => Feed.fetch(attrs.url),
  view: () =>
    m(CSS.folder, [
      m(CSS.iconRss),
      !Feed.data && !Feed.error ? "Loading.." : null,
      Feed.error
        ? m(".db.pa2.tc", [
            m(CSS.iconFrown),
            m(".f6", `error fetching url: ${attrs.url}`)
          ])
        : null,
      Feed.data
        ? Object.values(Feed.data).map(item =>
            m(CSS.folderCard, { href: item.link, target: "_blank" }, [
              item.title,
              m(CSS.iconExternalLink)
            ])
          )
        : null
    ])
};

export default Rss;
