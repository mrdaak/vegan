import m from "mithril";
import toml from "@iarna/toml";

import Folder, { FolderPlaceholder } from "./view/folder";
import Rss from "./view/rss";
import ClockFolder from "./view/clock";
import CSS from "./style";
import { SAMPLE_BOARD } from "./const";
import { Folders } from "./model";

const Root = () => {
  const cachedStore = localStorage.getItem("store");
  let store = cachedStore ? JSON.parse(cachedStore) : SAMPLE_BOARD;

  Folders.init();

  const readConfigFile = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const config = toml.parse(e.target.result);
      const projectKey = Object.keys(config)[0];
      store = config[projectKey];
      localStorage.setItem("store", JSON.stringify(store));
      Folders.loadFromConfig(store.folders);
    };
    reader.readAsText(file);
  };

  return {
    view: () =>
      m(CSS.appContainer, [
        m(CSS.header, [
          m(CSS.boardTitle, store.title),
          m(CSS.selectFileButton, { onchange: readConfigFile }),
          m(CSS.selectFileLabel, "load config")
        ]),
        m(CSS.foldersContainer, [
          ...Object.values(Folders.data).map(folder =>
            m(Folder, {
              ...folder
            })
          ),
          m(FolderPlaceholder),
          store.rss_url ? m(Rss, { url: store.rss_url }) : null,
          store.timezones.length
            ? m(ClockFolder, { timezones: store.timezones })
            : null
        ])
      ]),
    oncreate: () => {
      feather.replace();
    },
    onupdate: () => {
      feather.replace();
    }
  };
};

const mountNode = document.querySelector("#app");
m.mount(mountNode, Root);
