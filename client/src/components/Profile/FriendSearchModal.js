import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getFilteredUsers, addFriend } from "../../bd/Users";

const FriendSearchModal = ({ isOpen, onRequestClose, userProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      if (searchTerm) {
        const allUsers = await getFilteredUsers(userProfile.id);
        setFilteredUsers(
          allUsers.filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredUsers([]);
      }
    };

    fetchFilteredUsers();
  }, [searchTerm, userProfile]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddFriend = async (friendId) => {
    try {
      await addFriend(userProfile.id, friendId);
      onRequestClose();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <button onClick={onRequestClose} className="btn-close" />
      <h2>Cherche des amis</h2>
      <hr />
      <div>
        <input
          className="friend-search-input"
          type="text"
          placeholder="Cherche des amis"
          value={searchTerm}
          onChange={handleSearch}
        />
        <ul>
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <div className="box-btn-modal">
                {user.name}{" "}
                <button
                  type="submit"
                  className="btn-save"
                  onClick={() => handleAddFriend(user.id)}
                >
                  Add Friend
                </button>
              </div>
              <hr />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default FriendSearchModal;
