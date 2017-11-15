import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";


@Injectable()
export class CarService {


  constructor(public http: HttpClient) {}


  async getBrands() {
    return await this.http.get<any>('https://api.auto.ria.com/categories/1/marks')
        .toPromise()
  }


  async getModels(brand_id) {
    return await this.http.get<any>(`https://api.auto.ria.com/categories/1/marks/${brand_id}/models`)
      .toPromise()
  }

  async getModelPrice(brand_id, model_id) {
    return await this.http.get<any>(`https://api.auto.ria.com/average?marka_id=${brand_id}&model_id=${model_id}`)
      .toPromise()
  }

}
