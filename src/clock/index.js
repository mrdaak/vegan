import m from "mithril";
import { SECOND } from "../const";
import { utcToZonedTime, format } from "date-fns-tz";
import CSS from "../styles";

const DATE_FORMAT_PATTERN = "d.M HH:mm";

const Clock = () => {
  const now = () => new Date();
  let currentTime = now();
  let intervalId = null;

  return {
    view: ({ attrs }) =>
      m(`${CSS.folderCard}.flex.justify-between`, [
        m("span", attrs.timezone.split("/")[1]),
        m(
          "span",
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

const ClockFolder = () => {
  return {
    view: ({ attrs }) =>
      m(CSS.folder, { style: { height: "min-content" } }, [
        m(CSS.iconClock),
        m(
          CSS.folderCardsWrapper,
          { style: { minHeight: "120px" } },
          attrs.timezones &&
            attrs.timezones.map(tz => m(Clock, { timezone: tz }))
        )
      ])
  };
};

export default ClockFolder;
