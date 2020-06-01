import http from "../http-common";

class DinozService {
  getAll() {
    return http.get("/dinozs");
  }

  get(id) {
    return http.get(`/dinozs/${id}`);
  }

  create(data) {
    return http.post("/dinozs", data);
  }

  update(id, data) {
    return http.put(`/dinozs/${id}`, data);
  }

  delete(id) {
    return http.delete(`/dinozs/${id}`);
  }

  deleteAll() {
    return http.delete(`/dinozs`);
  }

  getFrozen() {
    return http.get(`/dinozs/frozen`);
  }
}

export default new DinozService();