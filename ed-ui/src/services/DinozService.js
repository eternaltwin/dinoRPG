import http from "../http-common";

class DinozService {
  getAll() {
    return http.get("/dinoz");
  }

  get(id) {
    return http.get(`/dinoz/${id}`);
  }

  create(data) {
    return http.post("/dinoz", data);
  }

  update(id, data) {
    return http.put(`/dinoz/${id}`, data);
  }

  delete(id) {
    return http.delete(`/dinoz/${id}`);
  }

  deleteAll() {
    return http.delete(`/dinoz`);
  }

  getFrozen() {
    return http.get(`/dinoz/frozen`);
  }

  getDinozFiche(id) {
    return http.get(`/dinoz/fiche/${id}`);
  }

  getDinozPlayer(id) {
    return http.get(`/dinoz/player/${id}`);
  }
}

export default new DinozService();