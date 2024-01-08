import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  SkyWayStreamFactory,
  SkyWayContext,
  SkyWayRoom,
  LocalAudioStream,
  LocalVideoStream,
  RoomPublication,
  LocalP2PRoomMember,
  P2PRoom,
} from "@skyway-sdk/room";
import { token } from "../../skyWay";
import { Publication } from "./components/publication";

export const LiveChat: FC = () => {
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

  const userPublications = useMemo<{ [key: string]: RoomPublication[] }>(() => {
    if (!publications || !me) return {};
    return (
      publications
        .filter((publication) => publication.publisher.id !== me.id)
        // NOTE: videoとaudioをまとめるためにpublisher.idでグルーピングする
        .reduce<{ [key: string]: RoomPublication[] }>((acc, publication) => {
          if (acc[publication.publisher.id]) {
            acc[publication.publisher.id].push(publication);
          } else {
            acc[publication.publisher.id] = [publication];
          }
          return acc;
        }, {})
    );
  }, [publications, me]);

  const gridColumnsName = useMemo(() => {
    const userLength = Object.keys(userPublications).length;
    if (userLength <= 1) return "grid-cols-1";
    if (userLength <= 2) return "grid-cols-2";
    return "grid-cols-3";
  }, [userPublications]);

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
      // console.log("onStreamPublished", e.publication.id);

      /**
       * NOTE: 複数のイベントが発火するため、そのままsetPublicationsを呼ぶとステート更新が間に合わない
       * そのため、一時的に配列に格納してからまとめてsetPublicationsを呼ぶ
       */
      if (me.id !== e.publication.publisher.id) {
        addPublications.current.push(e.publication);
      }

      setTimeout(() => {
        // console.log("setPublications", publications, addPublications);
        setPublications([...publications, ...addPublications.current]);
      }, 100);
    });
  }, [currentRoom, me]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <p>
          <span>ID:</span>
          <span id="my-id" className="ml-4" ref={myIdRef}>
            {me?.id}
          </span>
        </p>
        <div className="flex items-center gap-2">
          room name:{" "}
          <input
            id="room-name"
            className="h-8 border border-gray-400"
            type="text"
            ref={roomNameRef}
          />
          <button
            id="join"
            className="bg-blue-500 text-white font-bold px-4 py-1 rounded-md hover:bg-blue-600 active:bg-blue-700"
            ref={joinRef}
            onClick={join}
          >
            join
          </button>
        </div>
      </div>

      <div className="flex w-full h-[calc(100vh-64px-50px)] gap-4">
        <div className="bg-red-100 flex items-center">
          <video width="400" muted playsInline ref={videoRef}></video>
        </div>
        <div
          className={`bg-blue-100 flex-1 grid gap-4 ${gridColumnsName} overflow-auto`}
        >
          {currentRoom && me && publications && (
            <>
              {Object.entries(userPublications).map(
                ([publisherId, publications]) => (
                  <div
                    key={publisherId}
                    className="flex justify-center items-center bg-blue-200"
                  >
                    {publications.map((publication) => (
                      <Publication
                        key={publication.id}
                        me={me}
                        publication={publication}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
