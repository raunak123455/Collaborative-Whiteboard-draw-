import React from "react";

const UserCursors = ({ userCount }) => {
  return (
    <div className="user-cursors">
      {/* Cursors and user count will be rendered here */}
      <span>Users in room: {userCount || 1}</span>
    </div>
  );
};

export default UserCursors;
