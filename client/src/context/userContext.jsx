import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

// eslint-disable-next-line react/prop-types
export function UserContextProvider({ children }) {
  const [username, setLoggedInUsername] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    axios.get("/profile").then((res) => {
      setId(res.data.userId);
      setLoggedInUsername(res.data.user);
    });
  }, []);

  return (
    <UserContext.Provider value={{ username, setLoggedInUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
