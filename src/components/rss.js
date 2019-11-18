import m from "mithril";

import CSS from "../styles";

const CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

const Feed = {
  data: null,
  error: null,
  fetch: url =>
    m
      .request({
        method: "GET",
        url
      })
      .then(
        ({ items }) =>
          (Feed.data = items.reduce((result, article) => {
            result[article.guid] = article;
            return result;
          }, {}))
      )
      .catch(error => (Feed.error = error))
};

const Rss = {
  oninit: ({ attrs }) => Feed.fetch(CORS_PROXY + attrs.url),
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
