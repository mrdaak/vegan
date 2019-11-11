import m from "mithril";
import CSS from "../styles";

const CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const SAMPLE_FEED_URL = "https://blog.codinghorror.com/rss/";

const Feed = {
  data: null,
  fetch: url =>
    m
      .request({
        method: "GET",
        url
      })
      .then(
        ({ items }) =>
          (Feed.data = items.reduce((res, cur) => {
            res[cur.guid] = cur;
            return res;
          }, {}))
      )
      .catch(error => console.error("Error fetching RSS feed.", error))
};

const Rss = {
  oninit: () => Feed.fetch(CORS_PROXY + SAMPLE_FEED_URL),
  view: () =>
    m(CSS.folder, [
      m("i[data-feather=rss]"),
      Feed.data &&
        Object.values(Feed.data).map(item =>
          m(CSS.folderCard, { href: item.link, target: "_blank" }, [
            item.title,
            m("i[data-feather=external-link].child.relative", {
              style: { width: "15px", height: "15px", top: "2px", left: "2px" }
            })
          ])
        )
    ])
};

export default Rss;
