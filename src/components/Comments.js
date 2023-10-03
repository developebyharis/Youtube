import { MdOutlineSort } from "react-icons/md";
import { BASE_URL } from "../utils/constants";
import React, { useState } from "react";
import Comment from "./Comment";
import { FaUserCircle } from "react-icons/fa";
import loadingGif from "../assests/loading-state.gif";
import { Icon } from "@iconify/react";
import { useInfiniteQuery } from "@tanstack/react-query";

const Comments = ({ videoId, commentCount }) => {
  const [showComments, setShowComments] = useState(false);

  // Function to toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const getComments = async (nextPageToken = "") => {
    const response = await fetch(
      BASE_URL +
        `/commentThreads?part=snippet%2Creplies&order=relevance&key=${
          process.env.REACT_APP_YOUTUBE_API_KEY
        }&videoId=${videoId}&textFormat=plainText&pageToken=${
          nextPageToken ?? ""
        }`
    );
    const data = await response.json();
    return data;
  };

  const { data, isLoading, fetchNextPage, isSuccess, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["watch-page", "comments", videoId],
      queryFn: ({ pageParam = null }) => getComments(pageParam),
      getNextPageParam: (lastPage, pages) => {
        return lastPage.nextPageToken;
      },
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1000 * 60 * 60 * 24,
      cacheTime: 1000 * 60 * 60 * 24,
    });
  const comments = data?.pages?.flatMap((page) => page.items) ?? [];

  return isLoading ? (
    <div className="w-full">
      <img className="w-12 h-12 m-auto" src={loadingGif} alt="" />
    </div>
  ) : (
    <div className="comment">
      <div className="flex gap-8 items-center mb-4 ">
        <div className="comment-count font-medium rounded-full p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-zinc-600" onClick={toggleComments}>
          {parseInt(commentCount).toLocaleString()} Comments 
        </div>
        <div className="sort flex gap-2 cursor-pointer items-center max-md:hidden">
          <MdOutlineSort size="1.5rem" />
          <span className="font-semibold text-sm">Sort by</span>
        </div>
      </div>
      <div className="add_comment text-sm flex p-2 gap-4 my-8 dark:bg-zinc-700 bg-zinc-200 rounded-lg">
        <div className="user_pic">
          <FaUserCircle size="2.5rem" />
        </div>
        <div className="comment_input w-full ">
            <input
              className="border-none bg-gray-300 dark:bg-zinc-600 px-3 rounded-full w-full h-8 py-2 dark:focus:border-white focus:border-black focus:border-b-2"
              type="text"
              placeholder="Add a comment..."
            />

          <div className="flex justify-end gap-4 pt-2 font-semibold">
            <button className="hover:bg-white dark:hover:bg-zinc-700 px-4 py-2 rounded-full">
              Cancel
            </button>
            <button className="bg-white px-4 py-2 rounded-3xl text-black">
              Comment
            </button>
          </div>
        </div>
      </div>
      <div className="comments">
        {showComments &&
          isSuccess &&
          comments.map((comment) => (
            <Comment key={comment.id} commentData={comment} />
          ))}
      </div>

      {showComments && ( // Only display the "Show More" button when comments are visible
        isLoading || isFetchingNextPage ? (
          <div className="w-full">
            <img className="w-12 h-12 m-auto" src={loadingGif} alt="" />
          </div>
        ) : (
          <button
            className="w-full font-bold bg-gray-200 dark:bg-zinc-700 rounded-3xl px-4 py-1"
            onClick={fetchNextPage}
          >
            Show More
          </button>
        )
      )}
    </div>
  );
};

export default Comments;
