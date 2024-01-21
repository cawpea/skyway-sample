import { FC } from "react";
import { Input } from "@chakra-ui/react";
import { Button } from "components";

export const LiveChatController: FC = () => {
  return (
    <div className="fixed left-0 right-0 bottom-10 mx-auto px-4 py-2 w-[400px] text-white bg-gray-900 border border-solid border-gray-600 opacity-85 rounded-full shadow-lg">
      <div className="flex justify-center items-center gap-1">
        <Input bg="white" w="200px" placeholder="Input room name" />
        <Button>Join</Button>
      </div>
    </div>
  );
};
