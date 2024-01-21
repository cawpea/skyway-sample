import { FC, useState } from "react";
import { Input } from "@chakra-ui/react";
import { Button } from "components";

type Props = {
  isJoined?: boolean;
  onJoin?: (roomName: string) => void;
  onLeave?: () => void;
};

export const LiveChatController: FC<Props> = ({
  isJoined,
  onJoin,
  onLeave,
}) => {
  const [roomName, setRoomName] = useState<string>("");

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
          <Button type="button" onClick={() => onJoin && onJoin(roomName)}>
            Join
          </Button>
        )}
      </form>
    </div>
  );
};
