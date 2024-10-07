import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getFilteredUsers, addFriend } from "../../bd/Users";

const FriendSearchModal = ({ isOpen, onRequestClose, userProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      if (searchTerm) { // Выполняем запрос только если есть поисковый запрос
        const allUsers = await getFilteredUsers(userProfile.id);
        setFilteredUsers(
          allUsers.filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredUsers([]); // Очищаем список, если строка поиска пустая
      }
    };

    fetchFilteredUsers();
  }, [searchTerm, userProfile]); // Запрос обновляется при каждом изменении searchTerm

  const handleSearch = (e) => {
    setSearchTerm(e.target.value); // Обновляем поисковый запрос
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
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Search Friends</h2>
      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={handleSearch}
      />
      <ul>
        {filteredUsers.map((user) => (
          <li key={user.id}>
            {user.name}{" "}
            <button onClick={() => handleAddFriend(user.id)}>
              Add Friend
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default FriendSearchModal;
