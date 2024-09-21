import useMapBoxStore from "@/store/mapBox";

export default function useAddUser() {
  const { loadUserMapData } = useMapBoxStore((state) => state);
  const addOneMapUser = (rawUser) => {
    const newUserData = [
      {
        name: rawUser.username,
        address: rawUser.address,
        service: "Service 1",
        category: "ERyAkMPB",
        location: {
          latitude: +rawUser.latitude || 0,
          longitude: +rawUser.longitude || 0,
        },
        timestamp: new Date().toISOString(),
      },
    ];
    loadUserMapData(newUserData);
  };

  const addMapUsers = (rawUsers) => {
    const newUserData = rawUsers.map((rawUser) => ({
      name: rawUser.username,
      address: rawUser.address,
      service: "Service 1",
      category: "ERyAkMPB",
      location: {
        latitude: +rawUser.latitude || 0,
        longitude: +rawUser.longitude || 0,
      },
      timestamp: new Date().toISOString(),
    }));
    loadUserMapData(newUserData);
  };

  return {
    addOneMapUser,
    addMapUsers,
  };
}
