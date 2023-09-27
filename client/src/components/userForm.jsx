import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/userContext";

export default function UserForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const { setLoggedInUsername, setId } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isRegistered === false ? "/register" : "/login";
      const { data } = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  return (
    <div className="bg-blue-100 h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl p-2 mb-2">Chatbox</h1>
      {error !== "" ? <span className="text-red-700">{error}</span> : ""}
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button type="submit" className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isRegistered ? "Login" : "Register"}
        </button>
      </form>
      <div className="text-center">
        {!isRegistered ? "Already have an account?" : "Don't have an account?"}
        <button
          onClick={() => {
            setIsRegistered(!isRegistered);
            setError("");
          }}
          className="text-blue-700 ml-1"
          type="button"
        >
          {isRegistered ? "Register" : "Login"}
        </button>
      </div>
    </div>
  );
}
