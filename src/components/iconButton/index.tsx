import { ButtonHTMLAttributes, FC } from "react";
import {
  IconButton as ChakraIconButton,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton: FC<Props> = ({ icon, label, ...rest }) => {
  return (
    <Tooltip label={label} placement="top">
      <ChakraIconButton
        icon={<Icon as={icon} />}
        aria-label={label}
        isRound
        fontSize={24}
        bg="gray.600"
        color="white"
        _hover={{
          bg: "gray.500",
        }}
        _active={{
          bg: "gray.400",
        }}
        {...rest}
      />
    </Tooltip>
  );
};
