import React from "react";

export const SpotifyAppView = () => {
  return (
    <div className="w-full h-full bg-[#1A1A1A] overflow-hidden flex flex-col rounded-b-[10px] relative">
      <iframe
        style={{ borderRadius: "0px" }}
        src="https://open.spotify.com/embed/playlist/0NkxEaP6ERL8Dm5ucJTT49?utm_source=generator&theme=0"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full flex-1 border-none pointer-events-auto"
      />
    </div>
  );
};
