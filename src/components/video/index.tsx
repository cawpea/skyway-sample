import { FC, useEffect, useRef, useState } from "react";
import {
  SkyWayStreamFactory,
  SkyWayContext,
  SkyWayRoom,
  LocalAudioStream,
  LocalVideoStream,
  RoomPublication,
  LocalP2PRoomMember,
  P2PRoom,
  RemoteAudioStream,
  RemoteVideoStream,
} from "@skyway-sdk/room";
import { token } from "../../skyWay";

const Publication: FC<{
  me: LocalP2PRoomMember;
  publication: RoomPublication;
}> = ({ me, publication }) => {
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

export const Video: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomNameRef = useRef<HTMLInputElement>(null);
  const myIdRef = useRef<HTMLSpanElement>(null);
  const joinRef = useRef<HTMLButtonElement>(null);

  const [currentAudio, setCurrentAudio] = useState<LocalAudioStream>();
  const [currentVideo, setCurrentVideo] = useState<LocalVideoStream>();
  const [me, setMe] = useState<LocalP2PRoomMember>();
  const [currentRoom, setCurrentRoom] = useState<P2PRoom>();
  const [publications, setPublications] = useState<RoomPublication[]>([]);

  const addPublications = useRef<RoomPublication[]>([]);

  const startVideo = async () => {
    if (!videoRef.current) return;

    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();

    video.attach(videoRef.current);
    await videoRef.current.play();

    setCurrentAudio(audio);
    setCurrentVideo(video);
  };

  const join = async () => {
    const roomName = roomNameRef.current?.value;
    if (!roomName || !currentAudio || !currentVideo) return;

    const context = await SkyWayContext.Create(token);
    const room = await SkyWayRoom.FindOrCreate(context, {
      type: "p2p",
      name: roomName,
    });

    const me = await room.join();

    setMe(me);
    setCurrentRoom(room);

    await me.publish(currentAudio);
    await me.publish(currentVideo);

    console.log("me", me.id);

    console.log(
      "room",
      room.publications.map((p) => p.publisher.id)
    );

    addPublications.current = room.publications.filter(
      (publication) => publication.publisher.id !== me.id
    );
  };

  useEffect(() => {
    startVideo();
  }, []);

  useEffect(() => {
    if (!currentRoom || !me) return;

    currentRoom.onStreamPublished.add((e) => {
      console.log("onStreamPublished", e.publication.id);

      /**
       * NOTE: 複数のイベントが発火するため、そのままsetPublicationsを呼ぶとステート更新が間に合わない
       * そのため、一時的に配列に格納してからまとめてsetPublicationsを呼ぶ
       */
      if (me.id !== e.publication.publisher.id) {
        addPublications.current.push(e.publication);
      }

      setTimeout(() => {
        console.log("setPublications", publications, addPublications);
        setPublications([...publications, ...addPublications.current]);
      }, 100);
    });
  }, [currentRoom, me]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p>
        ID:{" "}
        <span id="my-id" ref={myIdRef}>
          {me?.id}
        </span>
      </p>
      <div>
        room name: <input id="room-name" type="text" ref={roomNameRef} />
        <button id="join" ref={joinRef} onClick={join}>
          join
        </button>
      </div>

      <video width="400px" muted playsInline ref={videoRef}></video>

      {currentRoom && me && (
        <section>
          <h2>Publishers</h2>
          {publications
            .filter((publication) => publication.publisher.id !== me.id)
            .map((publication) => (
              <Publication
                key={publication.id}
                me={me}
                publication={publication}
              />
            ))}
        </section>
      )}
    </div>
  );
};
