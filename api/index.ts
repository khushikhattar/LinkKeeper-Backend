import app from "../src/app";
import serverless from "serverless-http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default serverless(app);
