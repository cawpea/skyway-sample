import {
  LocalP2PRoomMember,
  RoomPublication,
  RemoteAudioStream,
  RemoteVideoStream,
} from "@skyway-sdk/room";
import { FC, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  me: LocalP2PRoomMember;
  publication: RoomPublication;
};

export const Publication: FC<Props> = ({ me, publication }) => {
  const isFirstRender = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stream, setStream] = useState<RemoteAudioStream | RemoteVideoStream>();

  const subscribe = useCallback(async () => {
    if (me.id === publication.publisher.id) return;
    me.subscriptions.forEach((subscription) => {
      console.log("subscription", subscription);
    });
    const { stream } = (await me.subscribe(publication.id)) as {
      stream: RemoteAudioStream | RemoteVideoStream;
    };
    console.log(
      "me",
      me.id,
      `publisher`,
      publication.publisher.id,
      "track",
      stream.track.kind
    );
    setStream(stream);
  }, [publication, me]);

  useEffect(() => {
    if (!stream) return;
    if (stream.track.kind === "video" && videoRef.current) {
      stream.attach(videoRef.current);
    }
    if (stream.track.kind === "audio" && audioRef.current) {
      stream.attach(audioRef.current);
    }
  }, [stream]);

  useEffect(() => {
    // NOTE: 1回目のレンダリングではsubscribeしても有効にならないため、2回目で実行する
    if (!isFirstRender.current) {
      subscribe();
    }
    isFirstRender.current = false;
  }, [isFirstRender, subscribe]);

  return (
    <>
      {/* <button type="button" onClick={subscribe} ref={buttonRef}>
        {publication.publisher.id}: ${publication.contentType}
      </button> */}

      {stream && stream.track.kind === "video" && (
        <video playsInline autoPlay ref={videoRef} className="w-full"></video>
      )}
      {stream && stream.track.kind === "audio" && (
        <audio
          controls
          autoPlay
          ref={audioRef}
          className="invisible h-0"
        ></audio>
      )}
    </>
  );
};
