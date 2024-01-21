import { FC, useState } from "react";
import { HStack, Input } from "@chakra-ui/react";
import { Button, IconButton } from "components";
import { Disc, Pause, Video, VideoOff } from "lucide-react";

export type VideoStatus = "on" | "off";

type Props = {
  isJoined?: boolean;
  onJoin?: (roomName: string) => void;
  onLeave?: () => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onVideoChange?: (videoStatus: VideoStatus) => void;
};

export const LiveChatController: FC<Props> = ({
  isJoined,
  onJoin,
  onLeave,
  onRecordingStart,
  onRecordingStop,
  onVideoChange,
}) => {
  const [roomName, setRoomName] = useState<string>("");
  const [isRecording, setRecording] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("on");

  const startRecording = () => {
    onRecordingStart && onRecordingStart();
    setRecording(true);
  };

  const stopRecording = () => {
    onRecordingStop && onRecordingStop();
    setRecording(false);
  };

  const toggleVideo = () => {
    if (videoStatus === "on") {
      setVideoStatus("off");
      onVideoChange && onVideoChange("off");
    } else {
      setVideoStatus("on");
      onVideoChange && onVideoChange("on");
    }
  };

  return (
    <div className="fixed left-0 right-0 bottom-10 mx-auto px-4 py-2 w-[400px] text-white bg-gray-900 border border-solid border-gray-600 rounded-full shadow-lg">
      <form className="flex justify-center items-center gap-1">
        <Input
          color={isJoined ? "gray.600" : "gray.900"}
          readOnly={isJoined}
          cursor={isJoined ? "not-allowed" : "auto"}
          bg={isJoined ? "gray.300" : "gray.100"}
          w="200px"
          placeholder="Input room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        {isJoined ? (
          <Button type="button" priority="destructive" onClick={onLeave}>
            Leave
          </Button>
        ) : (
          <HStack spacing="2">
            <Button type="button" onClick={() => onJoin && onJoin(roomName)}>
              Join
            </Button>
            {/* <IconButton icon={Mic} label="Mute" /> */}
          </HStack>
        )}
        {isJoined && (
          <HStack ml="2" spacing="2">
            <IconButton
              icon={videoStatus === "on" ? Video : VideoOff}
              label={videoStatus === "on" ? "Video Off" : "Video On"}
              onClick={toggleVideo}
            />
            <IconButton
              icon={isRecording ? Pause : Disc}
              label={isRecording ? "Recording Stop" : "Recording"}
              onClick={isRecording ? stopRecording : startRecording}
            />
          </HStack>
        )}
      </form>
    </div>
  );
};
