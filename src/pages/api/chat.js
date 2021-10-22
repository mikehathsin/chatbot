import { Wit } from "node-wit";
import Pusher from "pusher";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

const db = new JsonDB(new Config("myDataBase", true, false, "/"));

const client = new Wit({
  accessToken: "N5ZFS4W5CPU7SR6T3VJIZL5HV3IHZKA7",
});

const pusher = new Pusher({
  appId: "1285818",
  key: "f420415633e02495464a",
  secret: "0115849b10bf412b8817",
  cluster: "us2",
  useTLS: true,
});

const responses = {
  greetings: ["Hola 👋", "Buenas tardes 👋"],
};

const firstEntityValue = (entities, entity) => {
  const val =
    entities &&
    entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;

  if (!val) {
    return null;
  }

  return val;
};

const handleMessage = ({ entities }) => {
  const greetings = firstEntityValue(entities, "saludos:saludos");
  const isManga = Object.keys(entities).includes("manga:manga");
  const isAvailable = Object.keys(entities).includes(
    "disponibilidad:disponibilidad"
  );
  const isPrice = Object.keys(entities).includes("precio:precio");

  if (greetings) {
    return pusher.trigger("bot", "bot-response", {
      message:
        responses.greetings[
          Math.floor(Math.random() * responses.greetings.length)
        ],
    });
  }

  if (isManga && isAvailable) {
    db.push("/manga", entities["manga:manga"][0].value);
    return pusher.trigger("bot", "bot-response", {
      message: `Si tenemos disponible ${entities["manga:manga"][0].value}`,
    });
  }

  if (isPrice) {
    const { manga } = db.getData("/");
    return pusher.trigger("bot", "bot-response", {
      message: `El precio de ${manga} es de 15 USD`,
    });
  }

  return pusher.trigger("bot", "bot-response", {
    message: "No entiendo 😔",
  });
};

const handler = (req, res) => {
  const { message } = req.body;

  client
    .message(message)
    .then((data) => {
      handleMessage(data);
      res.status(200).json(data);
    })
    .catch((error) => console.log(error));
};

export default handler;
