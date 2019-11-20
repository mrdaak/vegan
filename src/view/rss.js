import m from "mithril";

import { Feed } from "../model";
import CSS from "../styles";

const Rss = {
  oninit: ({ attrs }) => Feed.fetch(attrs.url),
  view: () =>
    m(CSS.folder, { style: CSS.folderStyleAttribute }, [
      m(CSS.iconRss),
      !Feed.data && !Feed.error ? "Loading.." : null,
      Feed.error
        ? m(".db.pa2.tc", [
            m(CSS.iconFrown, { style: CSS.iconFrownStyleAttribute }),
            m(".f6", `error fetching url: ${attrs.url}`)
          ])
        : null,
      Feed.data
        ? Object.values(Feed.data).map(item =>
            m(CSS.folderCard, { href: item.link, target: "_blank" }, [
              item.title,
              m(CSS.iconExternalLink, {
                style: CSS.iconExternalLinkStyleAttribute
              })
            ])
          )
        : null
    ])
};

export default Rss;