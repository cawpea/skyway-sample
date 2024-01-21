import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useToast, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
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
import { Publication, LiveChatController } from "./components";
import { storage } from "../../firebaseApp";
import { createFileToStorage } from "../../services/storage";

export const LiveChat: FC = () => {
  const toast = useToast();
  const allStream = useRef<MediaStream>();
  const mediaRecorder = useRef<MediaRecorder>();
  const [isJoined, setJoined] = useState<boolean>(false);
  const [isRecording, setRecording] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const myIdRef = useRef<HTMLSpanElement>(null);

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

    allStream.current = new MediaStream();

    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();

    video.attach(videoRef.current);
    await videoRef.current.play();

    setCurrentAudio(audio);
    setCurrentVideo(video);

    allStream.current.addTrack(audio.track);
    allStream.current.addTrack(video.track);
  };

  const subscribe = (stream: RemoteAudioStream | RemoteVideoStream) => {
    console.log("subscribe", stream);
    allStream.current?.addTrack(stream.track);
  };

  const join = async (roomName: string) => {
    if (!currentAudio || !currentVideo) return;

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
    setJoined(true);
  };

  const leave = () => {
    if (!currentRoom || !me) return;
    currentRoom.leave(me);

    if (isRecording) {
      stopRecording();
    }

    setMe(undefined);
    setCurrentRoom(undefined);
    setJoined(false);
  };

  const saveFileToStorage = async (blob: Blob, fileName: string) => {
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: new Date().getTime(),
    });
    const filePath = `recordings/${fileName}`;

    try {
      const path = await createFileToStorage(storage, file, filePath);

      toast({
        title: "Saved recording",
        description: (
          <Link
            href={path}
            isExternal
            display="flex"
            alignItems="center"
            gap="1"
          >
            Download Link
            <ExternalLinkIcon />
          </Link>
        ),
        status: "success",
        duration: null,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to save recording file",
        status: "error",
        duration: null,
        isClosable: true,
      });
    }
  };

  const startRecording = async () => {
    console.log("startRecording", allStream);
    if (!allStream.current) return;

    mediaRecorder.current = new MediaRecorder(allStream.current);
    const recordedBlobs: Blob[] = [];

    mediaRecorder.current.ondataavailable = (event) => {
      console.log("dataAvailable", event);
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };
    mediaRecorder.current.onstop = async (event) => {
      console.log("Recorder stopped", event);
      console.log("Recorder blobs", recordedBlobs);

      // Storageに保存する
      const blob = new Blob(recordedBlobs, { type: "video/webm" });
      await saveFileToStorage(blob, new Date().toISOString() + ".webm");

      // ローカルにダウンロードする
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.style.display = "none";
      // a.href = url;
      // a.download = "test.webm";
      // document.body.appendChild(a);
      // a.click();
      // setTimeout(() => {
      //   document.body.removeChild(a);
      //   window.URL.revokeObjectURL(url);
      // }, 100);
    };
    mediaRecorder.current.start();

    setRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    mediaRecorder.current.stop();
    setRecording(false);
  };

  useEffect(() => {
    startVideo();
  }, []);

  useEffect(() => {
    if (!currentRoom || !me) return;

    currentRoom.onStreamPublished.add((e) => {
      /**
       * NOTE: 複数のイベントが発火するため、そのままsetPublicationsを呼ぶとステート更新が間に合わない
       * そのため、一時的に配列に格納してからまとめてsetPublicationsを呼ぶ
       */
      if (me.id !== e.publication.publisher.id) {
        addPublications.current.push(e.publication);
      }

      setTimeout(() => {
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
                        onSubscribe={subscribe}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
      <LiveChatController
        isJoined={isJoined}
        onJoin={(roomName) => join(roomName)}
        onLeave={leave}
        onRecordingStart={startRecording}
        onRecordingStop={stopRecording}
      />
    </div>
  );
};
