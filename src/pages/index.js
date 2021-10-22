import { useEffect, useState } from "react";
import Pusher from "pusher-js";

const pusher = new Pusher("f420415633e02495464a", {
  cluster: "us2",
  useTLS: true,
});

const HomePage = () => {
  const [state, setState] = useState({
    userMessage: "",
    conversation: [],
  });

  useEffect(() => {
    const channel = pusher.subscribe("bot");
    channel.bind("bot-response", (data) => {
      const msg = {
        text: data.message,
        user: "ai",
      };
      setState((prevState) => ({
        ...prevState,
        conversation: [...prevState.conversation, msg],
      }));
    });
  }, []);

  const handleChange = (event) => {
    setState((prevState) => ({
      ...prevState,
      userMessage: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const msg = {
      text: state.userMessage,
      user: "user",
    };

    setState((prevState) => ({
      ...prevState,
      conversation: [...prevState.conversation, msg],
    }));

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: state.userMessage,
      }),
    });

    setState((prevState) => ({ ...prevState, userMessage: "" }));
  };

  const ChatBubble = (text, i, className) => {
    const classes = `${className} chat-bubble`;
    return (
      <div key={`${className}-${i}`} className={`${className} chat-bubble`}>
        <span className="chat-content">{text}</span>
      </div>
    );
  };

  const chat = state.conversation.map((e, index) =>
    ChatBubble(e.text, index, e.user)
  );

  return (
    <div>
      <h1>Realtime Mr. Yamaco's chatbot</h1>
      <div className="chat-window">
        <div className="conversation-view">{chat}</div>
        <div className="message-box">
          <form onSubmit={handleSubmit}>
            <input
              value={state.userMessage}
              onInput={handleChange}
              className="text-input"
              type="text"
              autofocus
              placeholder="Escribe tu mensaje y presiona Enter para enviar"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
