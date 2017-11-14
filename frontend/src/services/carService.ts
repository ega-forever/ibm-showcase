import request from 'request-promise';


export class CarService {

  async getBrands() {
    return await request({
      method: 'GET',
      uri: 'http://api.auto.ria.com/categories/1/marks',
      json: true
    });
  }


  async getModels(brand_id) {
    return await request({
      method: 'GET',
      uri: `http://api.auto.ria.com/categories/1/marks/${brand_id}/models`,
      json: true
    });
  }

  async getModelPrice(brand_id, model_id) {
    return await request({
      method: 'GET',
      uri: `http://api.auto.ria.com/average?marka_id=${brand_id}&model_id=${model_id}`,
      json: true
    });
  }

}
