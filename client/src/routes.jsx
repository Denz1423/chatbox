import { useContext } from "react";
import UserForm from "./components/userForm";
import Chat from "./components/chat";
import { UserContext } from "./context/userContext";

export default function Routes() {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }

  return <UserForm />;
}
