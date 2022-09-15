import { createReflectServer } from "@rocicorp/reflect-server";
import { mutators } from "../src/mutators";

const authHandler = async (auth: string) => {
  return {
    userID: auth,
  };
};

const { worker, RoomDO, AuthDO } = createReflectServer({
  mutators,
  authHandler,
  getLogLevel: () => "info",
});
export { worker as default, RoomDO, AuthDO };
