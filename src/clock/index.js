import m from "mithril";
import { SECOND } from "../const";

const Clock = () => {
  const now = () => new Date().toLocaleString();
  let currentTime = now();
  let intervalId = null;

  return {
    view: () => m("", currentTime),
    oncreate: () => {
      intervalId = setInterval(() => {
        currentTime = now();
        m.redraw();
      }, SECOND);
    },
    onremove: () => clearInterval(intervalId)
  };
};

export default Clock;
