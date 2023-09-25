import Avatar from "./avatar";

// eslint-disable-next-line react/prop-types
export default function Contact({userId, username, onclick, selected, online}) {
  return (
    <div
      key={userId}
      onClick={() => onclick(userId)}
      className={
        "border-b border-gray-300  flex items-center gap-2 cursor-pointer " +
        (userId === selected ? "bg-blue-50" : "")
      }
    >
      {userId === selected && (
        <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar username={username} userId={userId} online={online} />
        <span className="text-grey-800">{username}</span>
      </div>
    </div>
  );
}
