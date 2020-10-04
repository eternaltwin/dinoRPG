import http from "../http-common";

class DinozService {

	create(data) {
    	return http.post("/dinoz", data);
  	}

  	getDinozFiche(id) {
    	return http.get(`/dinoz/fiche/${id}`);
  	}

  	getDinozPlayer(id) {
    	return http.get(`/dinoz/player/${id}`);
  	}
}

export default new DinozService();