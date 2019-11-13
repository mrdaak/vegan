import m from "mithril";
import { SECOND } from "../const";
import { utcToZonedTime, format } from "date-fns-tz";

const DATE_FORMAT_PATTERN = "d.M HH:mm";

const Clock = () => {
  const now = () => new Date();
  let currentTime = now();
  let intervalId = null;

  return {
    view: ({ attrs }) =>
      m(".w-100.relative.mb1", [
        attrs.timezone.split("/")[1],
        m(
          ".absolute.dib.right-0",
          format(
            utcToZonedTime(currentTime, attrs.timezone),
            DATE_FORMAT_PATTERN
          )
        )
      ]),
    oncreate: () => {
      intervalId = setInterval(() => {
        currentTime = now();
        m.redraw();
      }, 5 * SECOND);
    },
    onremove: () => clearInterval(intervalId)
  };
};

export default Clock;
