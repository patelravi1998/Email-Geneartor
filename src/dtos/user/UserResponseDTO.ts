// src/dtos/UserResponseDTO.ts

export class loginResponseDTO {
  mobile_number?: bigint;

  constructor(id: bigint, name?: string, mobile_number?: bigint) {
    this.mobile_number = mobile_number;
  }
}

export class verifyResponseDTO {
  token: string;
  user_status:string;

  constructor(token: string,user_status:string) {
    this.token = token;
    this.user_status = user_status;
  }
}

export class registorResponseDTO {
  id?: bigint
  userType?: string;
  mobile?: bigint;


  constructor(
    id?: bigint,
    userType?: string,
    mobile?: bigint
  ) {
    this.id = id;
    this.userType = userType;
    this.mobile = mobile;
  }
}

export class userStoreResponseDTO{
  store_id?:string;
  storeType?:string;
  store_name?:string;
  store_category?:string;
  constructor(
    store_id?: string,
    storeType?: string,
    store_name?: string,
    store_category?:string,
  ) {
    this.store_id = store_id;
    this.storeType = storeType;
    this.store_name = store_name;
    this.store_category = store_category
  }
}
export class userDetailResponseDTO {
  id?: string
  userType?: string;
  name?: string;
  uuid?:string;
  code?:string;
  mobile?:string;
  defaultStoreName?:string;
  defaultStoreCategory?:string;
  date_of_birth?:Date;
  pancard_number?:string;
  total_points?:Number;
  stores?:userStoreResponseDTO[]
  constructor(
    id?: string,
    userType?: string,
    name?: string,
    uuid?:string,
    code?:string,
    mobile?:string,
    defaultStoreName?:string,
    defaultStoreCategory?:string,
    date_of_birth?:Date,
    pancard_number?:string,
    total_points?:Number,
    stores?:userStoreResponseDTO[]
  ) {
    this.id = id;
    this.userType = userType;
    this.name = name;
    this.uuid = uuid;
    this.code = code;
    this.mobile = mobile;
    this.defaultStoreName = defaultStoreName;
    this.defaultStoreCategory = defaultStoreCategory;
    this.date_of_birth = date_of_birth;
    this.pancard_number = pancard_number;
    this.total_points = total_points;
    this.stores = stores;
  }
}



// Other DTOs as needed
