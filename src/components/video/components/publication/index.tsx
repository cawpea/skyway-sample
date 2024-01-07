import {
  LocalP2PRoomMember,
  RoomPublication,
  RemoteAudioStream,
  RemoteVideoStream,
} from "@skyway-sdk/room";
import { FC, useEffect, useRef, useState } from "react";

type Props = {
  me: LocalP2PRoomMember;
  publication: RoomPublication;
};

export const Publication: FC<Props> = ({ me, publication }) => {
  console.log("me", me.id, `publisher`, publication.publisher.id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stream, setStream] = useState<RemoteAudioStream | RemoteVideoStream>();

  const handleClick = async () => {
    const { stream } = await me.subscribe(publication.id);
    setStream(stream as RemoteAudioStream | RemoteVideoStream);
  };

  useEffect(() => {
    if (!stream) return;
    if (stream.track.kind === "video" && videoRef.current) {
      stream.attach(videoRef.current);
    }
    if (stream.track.kind === "audio" && audioRef.current) {
      stream.attach(audioRef.current);
    }
  }, [stream]);

  return (
    <div>
      <button type="button" onClick={handleClick}>
        {publication.publisher.id}: ${publication.contentType}
      </button>

      {stream && stream.track.kind === "video" && (
        <video playsInline autoPlay ref={videoRef}></video>
      )}
      {stream && stream.track.kind === "audio" && (
        <audio controls autoPlay ref={audioRef}></audio>
      )}
    </div>
  );
};
