import { useContext } from "react";
import UserForm from "./components/userForm";
import { UserContext } from "./context/userContext";

export default function Routes() {
  const { username, id } = useContext(UserContext);

  if (username) {
    return "Logged in" + " "  + username + " " + id;
  }

  return <UserForm />;
}
