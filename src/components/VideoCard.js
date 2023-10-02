import moment from "moment";
import { BASE_URL } from "./../utils/constants";
import { Icon } from "@iconify/react";
import { decode } from "html-entities";
import { useQuery } from "@tanstack/react-query";

const VideoCard = ({ video }) => {
  const {
    id,
    snippet: {
      channelId,
      channelTitle,
      title,
      publishedAt,
      thumbnails: { medium },
    },
    contentDetails,
    statistics,
  } = video;

  const newTitle = decode(title);
  const _videoId = id?.videoId || contentDetails?.videoId || id;

  // const [views, setViews] = useState(null);
  // const [duration, setDuration] = useState(null);
  // const [channelIcon, setChannelIcon] = useState(null);

  // const seconds = duration && moment.duration(duration).asSeconds();
  // const _duration = duration && moment.utc(seconds * 1000).format("mm:ss");
  // // console.log(_duration);

  // const _videoId = id?.videoId || contentDetails?.videoId || id;

  const getVideoViewsAndDuration = async () => {
    const response = await fetch(
      BASE_URL +
        `/videos?part=contentDetails%2Cstatistics&id=${_videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    return data.items[0];
    // console.log(data);

    // setDuration(data?.items?.[0]?.contentDetails?.duration);
    // setViews(data?.items[0].statistics.viewCount);
  };

  const { data: videoDetails } = useQuery({
    queryKey: ["videoDetails", _videoId],
    queryFn: () => getVideoViewsAndDuration(_videoId),
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: !(contentDetails && statistics),
  });

  let views, duration;

  if (contentDetails && statistics) {
    duration = contentDetails?.duration;
    views = statistics.viewCount;
  } else {
    duration = videoDetails?.contentDetails?.duration;
    views = videoDetails?.statistics?.viewCount;
  }

  const seconds = moment.duration(duration).asSeconds();
  const _duration = moment.utc(seconds * 1000).format("mm:ss");

  const get_channel_icon = async () => {
    const response = await fetch(
      BASE_URL +
        `/channels?part=snippet&id=${channelId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    return data?.items?.[0]?.snippet?.thumbnails?.default?.url;
  };

  const { data: channelIcon2 } = useQuery({
    queryKey: ["channelIcon", channelId],
    queryFn: () => get_channel_icon(channelId),
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
    cacheTime: 1000 * 60 * 60 * 24,
  });

  return (
    <div className="video w-full cursor-pointer h-fit">
      <div className="video__thumbnail  relative">
        <img
          src={medium.url}
          className="rounded-xl w-full"
          alt="video thumbnail"
        />
        <div
          className={`absolute bottom-1 right-1 px-2 py-1 rounded-md text-xs text-white ${
            _duration === "00:00" ? "bg-red-600" : "bg-black/60"
          }`}
        >
          {_duration === "00:00" ? (
            <div className="bg-red-600 px-1 py-0.5 rounded font-bold flex gap-1 items-center">
              <Icon icon="fluent:live-20-regular" width="15" />
              <span>LIVE</span>
            </div>
          ) : (
            _duration
          )}
        </div>
      </div>
      <div className="video__details pt-4 dark:text-white">
        <div className="flex gap-2">
          <div className="channel-logo flex flex-shrink-0 ">
            <img
              src={channelIcon2}
              className="rounded-[50%] -mt-1  w-10 h-10  object-cover"
              alt="channel logo"
            />
          </div>

          <div className="video-detail">
            <div className="video-title -mt-1.5 font-semibold text-sm leading-snug ">
              {newTitle.length > 60 ? newTitle.slice(0, 60) + "..." : newTitle}
            </div>
            <div className="channel-name text-xs pt-0.5">
              {channelTitle} <span> • </span>{" "}
              {Intl.NumberFormat("en", { notation: "compact" }).format(views)}{" "}
              views
              <span> • </span> {moment(publishedAt).fromNow()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
