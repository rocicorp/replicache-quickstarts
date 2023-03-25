import {
  createDatadogMetricsSink,
  createReflectServer,
} from "@rocicorp/reflect-server";
import { mutators } from "../src/mutators";

const authHandler = async (auth: string) => {
  return {
    userID: auth,
  };
};

const { worker, RoomDO, AuthDO } = createReflectServer({
  mutators,
  authHandler,
  logLevel: "debug",
  metricsSink: createDatadogMetricsSink({
    apiKey: "58066c1d3098ad9cb0bb30bac696cc08",
    service: "reflect-todo",
  }),
});
export { worker as default, RoomDO, AuthDO };
