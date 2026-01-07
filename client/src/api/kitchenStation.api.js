const kitchenStationApi = {
  list: (restaurantId) => ({
    method: "GET",
    url: `/api/restaurants/${restaurantId}/kitchen-stations`,
  }),

  create: (restaurantId) => ({
    method: "POST",
    url: `/api/restaurants/${restaurantId}/kitchen-stations`,
  }),

  disable: (stationId) => ({
    method: "DELETE",
    url: `/api/kitchen-stations/${stationId}`,
  }),

  enable: (stationId) => ({
    method: "PATCH",
    url: `/api/kitchen-stations/${stationId}/enable`,
  }),
};

export default kitchenStationApi;
