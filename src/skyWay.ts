import { nowInSec, SkyWayAuthToken, uuidV4 } from "@skyway-sdk/room";

export const token = new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: process.env.REACT_APP_SKYWAY_API_KEY!,
      turn: true,
      actions: ["read"],
      channels: [
        {
          id: "*",
          name: "*",
          actions: ["write"],
          members: [
            {
              id: "*",
              name: "*",
              actions: ["write"],
              publication: {
                actions: ["write"],
              },
              subscription: {
                actions: ["write"],
              },
            },
          ],
          sfuBots: [
            {
              actions: ["write"],
              forwardings: [
                {
                  actions: ["write"],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}).encode(process.env.REACT_APP_SKYWAY_API_SECRET!);
